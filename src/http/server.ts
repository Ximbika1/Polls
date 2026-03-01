import fastify from "fastify";
import "dotenv/config";
import { createPoll } from "./routes/create-poll";
import { getPoll } from "./routes/get-poll";

// GET, POST, PUT(alteracao), DELETE, PATCH(alteracao de um campo especifico dentro de um recurso), HEAD, OPTIONS

const app = fastify();

app.register(createPoll);
app.register(getPoll);

app.listen({ port: 3333 }).then(() => {
	console.log("HTTP server runnig");
});

//ORMs
