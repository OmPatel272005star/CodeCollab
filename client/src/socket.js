import { io } from 'socket.io-client';

const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
        upgrade: true,
        rememberUpgrade: true
    };

    return io('https://codecollab-5f67.onrender.com', options);
};

export default initSocket;
