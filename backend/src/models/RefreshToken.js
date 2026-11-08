import mongoose from "mongoose";

/**
 * One document per issued refresh token.
 *
 * We store only a SHA-256 hash of the token (never the token itself), so a
 * database leak cannot be used to impersonate anyone. Having the tokens in the
 * database is what lets us REVOKE a session: logout, deactivating a user and
 * deleting a user all simply delete rows from this collection.
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// MongoDB deletes expired rows automatically (TTL index).
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
