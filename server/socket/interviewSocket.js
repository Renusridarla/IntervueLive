import ChatMessage from '../models/ChatMessage.js';
import Interview from '../models/Interview.js';
import Question from '../models/Question.js';

// Track online users per room: roomId -> Map(socketId -> { userId, name, role })
const roomPresence = new Map();
// Track active timers per room: roomId -> { remainingSeconds, isRunning, intervalId }
const roomTimers = new Map();

export const initInterviewSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New connection: ${socket.id}`);

    // User joins interview room
    socket.on('joinRoom', async ({ roomId, user }) => {
      if (!roomId || !user) return;

      const cleanRoomId = roomId.toUpperCase();
      socket.join(cleanRoomId);
      socket.roomId = cleanRoomId;
      socket.userInfo = user;

      // Update room presence map
      if (!roomPresence.has(cleanRoomId)) {
        roomPresence.set(cleanRoomId, new Map());
      }
      roomPresence.get(cleanRoomId).set(socket.id, user);

      // Get list of unique online participants
      const activeUsers = Array.from(roomPresence.get(cleanRoomId).values());
      io.to(cleanRoomId).emit('presenceUpdate', activeUsers);

      console.log(`[Socket.IO] ${user.name} (${user.role}) joined room ${cleanRoomId}`);

      // Send recent chat messages history
      try {
        const history = await ChatMessage.find({ interviewId: cleanRoomId })
          .sort({ createdAt: 1 })
          .limit(100);
        socket.emit('chatHistory', history);
      } catch (err) {
        console.error('Error fetching chat history:', err.message);
      }

      // If timer is already active in this room, emit current timer state
      if (roomTimers.has(cleanRoomId)) {
        const timerState = roomTimers.get(cleanRoomId);
        socket.emit('timerTick', { remainingSeconds: timerState.remainingSeconds, isRunning: timerState.isRunning });
      }
    });

    // Real-Time Chat Message
    socket.on('sendMessage', async ({ roomId, message }) => {
      if (!roomId || !message || !socket.userInfo) return;

      const cleanRoomId = roomId.toUpperCase();
      try {
        const chatDoc = await ChatMessage.create({
          interviewId: cleanRoomId,
          senderId: socket.userInfo._id || socket.userInfo.id,
          senderName: socket.userInfo.name,
          senderRole: socket.userInfo.role,
          message: message.trim()
        });

        io.to(cleanRoomId).emit('receiveMessage', chatDoc);
      } catch (err) {
        console.error('Save chat error:', err.message);
      }
    });

    // Question Events: Change question index / send question
    socket.on('sendQuestion', async ({ roomId, questionIndex, questionId }) => {
      const cleanRoomId = roomId?.toUpperCase();
      if (!cleanRoomId) return;

      try {
        await Interview.findOneAndUpdate(
          { interviewId: cleanRoomId },
          { currentQuestionIndex: questionIndex }
        );

        io.to(cleanRoomId).emit('receiveQuestion', {
          questionIndex,
          questionId
        });
      } catch (err) {
        console.error('Sync question error:', err.message);
      }
    });

    // Code Editor Live Sync & Code Submission
    socket.on('codeUpdate', ({ roomId, code, language }) => {
      const cleanRoomId = roomId?.toUpperCase();
      if (cleanRoomId) {
        socket.to(cleanRoomId).emit('codeUpdate', { code, language });
      }
    });

    socket.on('codeSubmit', async ({ roomId, questionId, code, language, candidateAnswer }) => {
      const cleanRoomId = roomId?.toUpperCase();
      if (!cleanRoomId) return;

      try {
        if (questionId) {
          await Question.findByIdAndUpdate(questionId, {
            submittedCode: code,
            codeLanguage: language,
            candidateAnswer: candidateAnswer || '',
            status: 'completed'
          });
        }

        io.to(cleanRoomId).emit('codeSubmitted', {
          candidateName: socket.userInfo?.name || 'Candidate',
          questionId,
          code,
          language,
          candidateAnswer
        });
      } catch (err) {
        console.error('Code submission error:', err.message);
      }
    });

    // Synchronized Timer Events
    socket.on('startTimer', ({ roomId, durationMinutes = 45 }) => {
      const cleanRoomId = roomId?.toUpperCase();
      if (!cleanRoomId) return;

      // Clear existing timer if any
      if (roomTimers.has(cleanRoomId)) {
        clearInterval(roomTimers.get(cleanRoomId).intervalId);
      }

      let remainingSeconds = durationMinutes * 60;
      const intervalId = setInterval(() => {
        if (remainingSeconds > 0) {
          remainingSeconds--;
          io.to(cleanRoomId).emit('timerTick', { remainingSeconds, isRunning: true });
          if (roomTimers.has(cleanRoomId)) {
            roomTimers.get(cleanRoomId).remainingSeconds = remainingSeconds;
          }
        } else {
          clearInterval(intervalId);
          roomTimers.delete(cleanRoomId);
          io.to(cleanRoomId).emit('timerEnded');
        }
      }, 1000);

      roomTimers.set(cleanRoomId, { remainingSeconds, isRunning: true, intervalId });
      io.to(cleanRoomId).emit('timerTick', { remainingSeconds, isRunning: true });
    });

    socket.on('pauseTimer', ({ roomId }) => {
      const cleanRoomId = roomId?.toUpperCase();
      if (roomTimers.has(cleanRoomId)) {
        const timerState = roomTimers.get(cleanRoomId);
        clearInterval(timerState.intervalId);
        timerState.isRunning = false;
        io.to(cleanRoomId).emit('timerTick', { remainingSeconds: timerState.remainingSeconds, isRunning: false });
      }
    });

    // Interview Status Transitions
    socket.on('startInterview', async ({ roomId }) => {
      const cleanRoomId = roomId?.toUpperCase();
      if (!cleanRoomId) return;

      try {
        await Interview.findOneAndUpdate(
          { interviewId: cleanRoomId },
          { status: 'in-progress', startTime: new Date() }
        );
        io.to(cleanRoomId).emit('interviewStarted');
      } catch (err) {
        console.error('Start interview error:', err.message);
      }
    });

    socket.on('endInterview', async ({ roomId }) => {
      const cleanRoomId = roomId?.toUpperCase();
      if (!cleanRoomId) return;

      try {
        if (roomTimers.has(cleanRoomId)) {
          clearInterval(roomTimers.get(cleanRoomId).intervalId);
          roomTimers.delete(cleanRoomId);
        }

        await Interview.findOneAndUpdate(
          { interviewId: cleanRoomId },
          { status: 'completed', endTime: new Date() }
        );

        io.to(cleanRoomId).emit('interviewEnded');
      } catch (err) {
        console.error('End interview error:', err.message);
      }
    });

    // Disconnect event
    socket.on('disconnect', () => {
      const cleanRoomId = socket.roomId;
      if (cleanRoomId && roomPresence.has(cleanRoomId)) {
        const roomMap = roomPresence.get(cleanRoomId);
        roomMap.delete(socket.id);

        if (roomMap.size === 0) {
          roomPresence.delete(cleanRoomId);
        } else {
          const activeUsers = Array.from(roomMap.values());
          io.to(cleanRoomId).emit('presenceUpdate', activeUsers);
        }
      }
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};
