const { ObjectId } = require("mongoose").Types;
const { User, Thought } = require("../models");

module.exports = {
  async getThoughts(req, res) {
    try {
      const thoughts = await Thought.find();
      res.json(thoughts);
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  async getSingleThought(req, res) {
    try {
      const { thoughtId } = req.params;
      if (!ObjectId.isValid(thoughtId)) {
        return res.status(400).json({ message: "Invalid thought ID" });
      }

      const thought = await Thought.findOne({ _id: thoughtId });

      if (!thought) {
        return res.status(404).json({ message: "No thought with that ID" });
      }

      res.json(thought);
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  },
  async createThought(req, res) {
    try {
      const { userId } = req.body;
      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const thought = await Thought.create(req.body);
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { thoughts: thought._id } },
        { new: true }
      );
      if (!user) {
        return res
          .status(404)
          .json({ message: "Thought created but no user with that ID found" });
      }
      res.json(thought);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },
  async deleteThought(req, res) {
    try {
      const { thoughtId } = req.params;
      if (!ObjectId.isValid(thoughtId)) {
        return res.status(400).json({ message: "Invalid thought ID" });
      }
      const thought = await Thought.findOneAndRemove({ _id: thoughtId });

      if (!thought) {
        return res.status(404).json({ message: "No such thought exists" });
      }

      await Recation.deleteMany({ _id: { $in: thought.reactions } });
      res.json({ message: "Thought successfully deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },
  async updateThought(req, res) {
    try {
      const { thoughtId } = req.params;
      if (!ObjectId.isValid(thoughtId)) {
        return res.status(400).json({ message: "Invalid thought ID" });
      }
      const thought = await Thought.findOneAndUpdate(
        { _id: thoughtId },
        { $set: req.body },
        { runValidators: true, new: true }
      );

      if (!thought) {
        return res.status(404).json({ message: "No thought with this id!" });
      }

      res.json(thought);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },
  async addReaction(req, res) {
    try {
      const { thoughtId } = req.params;
      if (!ObjectId.isValid(thoughtId)) {
        return res.status(400).json({ message: "Invalid thought ID" });
      }

      const thought = await Thought.findOneAndUpdate(
        { _id: thoughtId },
        { $push: { reactions: req.body } },
        { new: true, runValidators: true }
      );

      if (!thought) {
        return res
          .status(404)
          .json({ message: "No thought with that ID found" });
      }

      res.json(thought);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },
  async removeReaction(req, res) {
    try {
      const { thoughtId, reactionId } = req.params;
      if (!ObjectId.isValid(thoughtId) || !ObjectId.isValid(reactionId)) {
        return res
          .status(400)
          .json({ message: "Invalid thought ID or reaction ID" });
      }

      const thought = await Thought.findOneAndUpdate(
        { _id: thoughtId },
        { $pull: { reactions: { reactionId } } },
        { new: true }
      );

      if (!thought) {
        return res
          .status(404)
          .json({ message: "No thought with that ID found" });
      }

      res.json(thought);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },
};
