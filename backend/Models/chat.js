import mongoose from 'mongoose';
  

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  }],
  isGroupChat: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    default: ''
  },
  groupPfp: {
    type: String,
    required: true,
  },
  lastMessage: {
    text: {
      type: String,
      default: '',
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true, 
});

chatSchema.pre('save', function(next) {
  this.participants.sort();
  next();
});

chatSchema.index({ participants: 1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;