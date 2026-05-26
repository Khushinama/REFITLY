import mongoose from 'mongoose';

const test = () => {
  const id1 = new mongoose.Types.ObjectId("65f89f4d14a92abf4f752f79");
  const id2 = new mongoose.Types.ObjectId("65f89f4d14a92abf4f752f79");
  
  const arr = [id1];
  console.log("Standard JS Array indexOf on different ObjectId instance:", arr.indexOf(id2));
  
  // Mongoose array mock or test
  console.log("Check if they are equal using equals():", id1.equals(id2));
};

test();
