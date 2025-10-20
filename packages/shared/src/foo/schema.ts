import { Schema } from "effect";

export class Foo extends Schema.Class<Foo>("Foo")({
  id: Schema.String,
  name: Schema.String,
  description: Schema.String,
}) {}
