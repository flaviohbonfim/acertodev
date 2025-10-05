import mongoose from 'mongoose';

declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}
