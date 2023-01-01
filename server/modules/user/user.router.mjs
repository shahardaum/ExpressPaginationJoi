/* 
  if there is an error thrown in the DB, asyncMiddleware
  will pass it to next() and express will handle the error */
import raw from "../../middleware/route.async.wrapper.mjs";
import user_model from "./user.model.mjs";
import express from "express";
import joi from "joi";
const router = express.Router();

// const UserSchema = joi.object({
//     _id: joi.string().alphanum().required(),
//     first_name: joi.string().required(),
//     last_name: joi.string().required(),
//     email: joi.string().alphanum(),
//     phone: joi.alphanum().max(9),
//   });

// parse json req.body on post routes
router.use(express.json());

// CREATES A NEW USER
// router.post("/", async (req, res,next) => {
//    try{
//      const user = await user_model.create(req.body);
//      res.status(200).json(user);
//    }catch(err){
//       next(err)
//    }
// });

// CREATES A NEW USER
router.post(
  "/",
  raw(async (req, res) => {
    user_model.validate(req.body, { abortEarly: false });
    if (error) {
      return res.send("Invalid Request");
    } else {
      const user = await user_model.create(req.body);
      res.status(200).json(user);
    }
  })
);

// GET ALL USERS
router.get(
  "/",
  raw(async (req, res) => {
    const page = req.query.page || 0;
    const limit = req.query.items || 0;

    const users = await user_model.find().select(
      `-_id
                                          first_name 
                                          last_name
                                          email 
                                          phone`
    );
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let resultUsers = users.slice();
    resultUsers =
      req.query.page === 0 ? users : users.slice(startIndex, endIndex);
    res.status(200).json(resultUsers);
  })
);

// GETS A SINGLE USER
router.get(
  "/:id",
  raw(async (req, res) => {
    const user = await user_model.findById(req.params.id);
    // .select(`-_id
    //     first_name
    //     last_name
    //     email
    //     phone`);
    if (!user) return res.status(404).json({ status: "No user found." });
    res.status(200).json(user);
  })
);
// UPDATES A SINGLE USER
router.put(
  "/:id",
  raw(async (req, res) => {
    user_model.validate(req.body, { abortEarly: false });
    if (error) {
      return res.send(error.details);
    } else {
      const user = await user_model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        upsert: true,
      });
      res.status(200).json(user);
    }
  })
);

// DELETES A USER
router.delete(
  "/:id",
  raw(async (req, res) => {
    const user = await user_model.findByIdAndRemove(req.params.id);
    if (!user) return res.status(404).json({ status: "No user found." });
    res.status(200).json(user);
  })
);

//Pagination
router.get(
  "/",
  raw(async (req, res) => {
    const users = await user_model.find().select(`-_id
                                        first_name 
                                        last_name
                                        email 
                                        phone`);
    res.status(200).json(users);
  })
);

export default router;
