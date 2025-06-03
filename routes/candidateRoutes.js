const express = require("express");
const router = express.Router();

const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const Candidate = require("../models/candidate");

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === "admin";
  } catch (err) {
    return false;
  }
};
//POST route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      console.log("User is not authorized to add a candidate");
      return res
        .status(403)
        .json({ Message: "User is not authorized to add a candidate" });
    } else {
      console.log("admin role verified");
    }

    const data = req.body; // assuming the req body contains the candidate  data
    //const newPerson = new Person(data);

    //save newPerson to database

    // const response = await Person.insertMany(data);
    //----
    /// same code as below for response, const newPerson = new Person(data); // Create a new instance
    // await newPerson.save(); // Save the instance

    const response = await Candidate(req.body).save(); // This triggers the pre-save hook

    console.log("data saved");

    res.status(200).json({ response: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal sever error" });
  }
});

router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res
        .status(403)
        .json({ Message: "User is not authorized to add a candidate" });
    const candidateID = req.params.candidateID; // extarct id from the URL
    const updatedCandidateData = req.body; //updated data for the person

    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatedCandidateData,
      {
        new: true, //return the updated document
        runValidators: true, //Run mongoose validation
      }
    );
    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }
    console.log("candidate Data Updated");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: "Internal server error" });
  }
});

router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res
        .status(403)
        .json({ Message: "User is not authorized to add a candidate" });
    const candidateID = req.params.candidateID; // extarct id from the URL

    const response = await Candidate.findByIdAndDelete(candidateID);
    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }
    console.log("candidate Deleted");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: "Internal server error" });
  }
});
//lets start voting
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    const candidateID = req.params.candidateID; // extarct id from the URL
    const userId = req.user.id; // extarct id from the token

    // Check if the user has already voted
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (user.isVoted) {
      return res.status(400).json({ error: "You have already voted." });
    }
    if (user.role !== "voter") {
      return res.status(403).json({ error: "Only voters can cast votes." });
    }
    // Find the candidate and update their vote count
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found." });
    }
    candidate.votes.push({ user: userId });
    candidate.voteCount += 1; // Increment vote count
    await candidate.save();

    // Mark the user as having voted
    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: "Vote recored successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/vote/count", async (req, res) => {
  try {
    //Find all the candidates and sort them by there votecount in descending order
    const candidate = await Candidate.find().sort({ votecount: "desc" });

    //Map  the candidates to only return their name and votecount
    const voteRecord = candidate.map((data) => {
      return {
        name: data.party,
        count: data.voteCount,
      };
    });
    return res.status(200).json(voteRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    //find all the candidates and select only the name and party, excluding the _id
    const candidates = await Candidate.find({}, "name party -_id");
    //Return all the candidates
    return res.status(200).json(candidates);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
