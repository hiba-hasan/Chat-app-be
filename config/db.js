import mongoose from "mongoose";

export default async function connectToDb() {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Connected To Database");
    });
    await mongoose.connect(process.env.DB_URI);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.log("Disconnected from the database");
  });
  mongoose.connection.on("error", (error) => {
    console.log(error);
  });
  mongoose.connection.on("reconnected", () => {
    console.log("Reconnected to the database");
  });
}
