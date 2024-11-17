import { Queries } from "./queries";

export class UserQueries extends Queries {
  async createUser(username: string, password: string) {
    const doesUserExist = await this.userExistsByUsername(username);
    if (doesUserExist) {
      return null;
    }

    const { rows } = await this.pool.query(
      "INSERT INTO users(username, password) VALUES ($1, $2) RETURNING *",
      [username, password]
    );

    const user = rows[0];

    if (user) {
      delete user.password;
    }

    return user;
  }

  async userExistsByUsername(username: string) {
    const user = await this.getUserByUsername(username);
    if (user) {
      return true;
    }
    return false;
  }

  async userExistsById(id: string) {
    const user = await this.getUserById(id);
    if (user) {
      return true;
    }
    return false;
  }

  async deleteUserById(id: string) {
    await this.pool.query("DELETE FROM users WHERE id = $1", [id]);
  }

  async getUserById(id: string) {
    const { rows } = await this.pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    const user = rows[0];

    if (user) {
      delete user.password;
    }

    return user;
  }

  async getUserByUsername(username: string) {
    const { rows } = await this.pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    const user = rows[0];

    if (user) {
      delete user.password;
    }

    return user;
  }
}
