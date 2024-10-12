import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

const app = express();
app.use(express.json());
// All code should go below this line

const allowedKeys = ["name", "breed", "age", "description"];

app.get("/dogs", async (req, res) => {
  const dogs = await prisma.dog.findMany();

  res.json(dogs);
});

app.get("/dogs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const dog = await prisma.dog.findUnique({
      where: {
        id: +id,
      },
    });

    if (!dog) {
      return res
        .status(204)
        .json({ error: "Dog not found" });
    }

    res.json(dog);
  } catch (e) {
    return res
      .status(400)
      .json({ message: "id should be a number" });
  }
});
app.delete("/dogs/:id", async (req, res) => {
  const { id } = req.params;
  if (id === undefined || isNaN(+id)) {
    return res
      .status(400)
      .json({ message: "id should be a number" });
  }
  try {
    const dog = await prisma.dog.delete({
      where: {
        id: +id,
      },
    });
    return res.status(200).json(dog);
  } catch (e) {
    return res.status(204).json({ error: "Dog not found" });
  }
});

app.post("/dogs", async (req, res) => {
  const { name, breed, age, description } = req.body;
  const errors = [];

  const providedKeys = Object.keys(req.body);

  const invalidKeys = providedKeys.filter(
    (key) => !allowedKeys.includes(key)
  );
  if (invalidKeys.length > 0) {
    invalidKeys.map((key) => {
      errors.push(`'${key}' is not a valid key`);
    });
  }

  if (typeof name !== "string")
    errors.push("name should be a string");
  if (typeof breed !== "string")
    errors.push("breed should be a string");
  if (typeof age !== "number")
    errors.push("age should be a number");
  if (typeof description !== "string")
    errors.push("description should be a string");

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const dog = await prisma.dog.create({
      data: { name, breed, age, description },
    });

    res.status(201).json({
      message: `Great success! ${name} has been spawned.`,
    });
  } catch (e) {
    res.status(500).json({
      error: "An error occurred while creating the dog.",
    });
  }
});

app.patch("/dogs/:id", async (req, res) => {
  const { id } = req.params;
  const { name, breed, age, description } = req.body;
  const errors = [];
  const providedKeys = Object.keys(req.body);

  const invalidKeys = providedKeys.filter(
    (key) => !allowedKeys.includes(key)
  );
  if (invalidKeys.length > 0) {
    invalidKeys.map((key) => {
      errors.push(`'${key}' is not a valid key`);
    });
  }

  if (name && typeof name !== "string")
    errors.push("name should be a string");
  if (breed && typeof breed !== "string")
    errors.push("breed should be a string");
  if (age && typeof age !== "number")
    errors.push("age should be a number");
  if (description && typeof description !== "string")
    errors.push("description should be a string");

  if (errors.length > 0) {
    return res.status(201).json({ errors });
  }
  try {
    const dog = await prisma.dog.update({
      where: {
        id: +id,
      },
      data: {
        name,
        breed,
        age,
        description,
      },
    });

    res.status(201).json(dog);
  } catch (e) {
    res.status(404).json({ error: "Dog not found" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});
// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
