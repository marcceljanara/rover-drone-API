export default {
  transform: {
    '^.+\\.js$': 'babel-jest', // Gunakan babel-jest untuk mentransformasi file .js
  },
  transformIgnorePatterns: [
    '/node_modules/(?!nanoid)/', // Pastikan nanoid diproses oleh babel-jest
  ],
};
