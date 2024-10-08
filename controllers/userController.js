const { ObjectId } = require("mongoose").Types;
const { User, Thought } = require("../models");

const friendCount = async () => {
  const result = await User.aggregate([
    { $unwind: "$friends" },
    { $count: "totalFriends" }
  ]);
  return result.length > 0 ? result[0].totalFriends : 0;
}

module.exports = {
  async getUsers(req, res) {
    try {
      const users = await User.find().populate("thoughts");
      const count = await friendCount();
      const userObj = {
        users,
        friendCount: count,
      }
      res.json(userObj);
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  async getSingleUser(req, res) {
    try {
      const { userId } = req.params;
      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await User.findOne({ _id: userId }).populate("thoughts");

      const count = await friendCount();
      const userObj = {
        user,
        friendCount: count,
      }

      if (!user) {
        return res.status(404).json({ message: "No user with that ID" });
      }

      res.json(userObj);
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  async createUser(req, res) {
    try {
      const user = await User.create(req.body);
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await User.findOneAndDelete({ _id: userId });

      if (!user) {
        return res.status(404).json({ message: "No such user exists" });
      }

      await Thought.deleteMany({ _id: { $in: user.thoughts } });
      res.json({ message: "User successfully deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $set: req.body },
        { runValidators: true, new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "No user with this id!" });
      }

      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },
  async addFriend(req, res) {
    try {
      const { userId, friendId } = req.params;

      if (!ObjectId.isValid(userId) || !ObjectId.isValid(friendId)) {
        return res.status(400).json({ message: "Invalid user or friend ID" });
      }

      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { friends: friendId } },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "No user with that ID" });
      }

      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },
  async removeFriend(req, res) {
    try {
      const { userId, friendId } = req.params;

      if (!ObjectId.isValid(userId) || !ObjectId.isValid(friendId)) {
        return res.status(400).json({ message: "Invalid user or friend ID" });
      }

      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { friends: friendId } },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "No user with that ID" });
      }

      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },
};
