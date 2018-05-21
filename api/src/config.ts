const config = {
  jwtSecret: '3(QrwV(BCR}aA/AW',
  mongo: {
    dataBaseName: 'pingPongPulse',
    url: process.env.MONGO_URL || 'mongodb://mongo'
  },
  salt: '}3StTB',
};

export default config
