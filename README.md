<img width="572" height="143" alt="logo" src="https://github.com/user-attachments/assets/5943e26a-6387-4ca5-a313-4776425c3cba" />

# Full-stack type safety ORM

## Why?

The idea is to create a robust solution that helps maintain consistency from the database level to the frontend application. Tiny changes in the database structure will affect the whole application. **Say goodbye to "any".**

## Core Benefits

**End-to-End Type Safety**

- Database schema drives all types
- Compile-time error detection for database changes
- No runtime surprises from schema mismatches

**Developer Experience**

- Full IDE autocompletion for all queries and responses
- Auto-generated types from database schema
- Instant feedback on breaking changes

**Simplified Architecture**

- Just one API endpoint needed
- Reduced boilerplate code
- No duplicate type definitions

## How?

**There are two steps:**

- Generate types
- Reuse types on the backend and frontend with special type utilities and tools, which are **all provided by this library**

## Usage

Let's say we have the following monorepo folder structure:

```
apps/
  frontend/
  backend/
common/
  ui/
package.json
.env
```

Install the package:

```bash
pnpm i -D @iamsuperdev/typeful
```

Add `DATABASE_URL` to the `.env` file (only PostgreSQL is available at this moment).
It assumes the database has an existing data structure and schema.

Generate types:

```bash
pnpm generate common
```

Then in the common folder, a new folder named "generated" will appear.

Updated folder structure:

```
apps/
  frontend/
  backend/
common/
  generated/
  ui/
package.json
.env
```

Create a **single endpoint** on the backend:

```js
// Import the performQuery function
import { performQuery } from '@iamsuperdev/typeful'

serve({
  routes: {
    '/api': async (req) => {
      const data = await performQuery(req.body.query)
      return { data }
    },
  },
})
```

That's it for the backend! 🎉

Now let's create a users service on the frontend.

```js
import type { Tables } from "@repo/generated/tables";
import type { QueryInstance, DTO } from "@iamsuperdev/typeful";

// Create function for building query, which accepts userId parameter
function findUserById({ userId }) {
  return {
      tables: {
          users: {
              select: ['id', 'email'],
              where: { id: { eq: userId } },
              join: {
                  users_organizations: {
                      select: ['id', 'organization_id'],
                      where: { organization_id: { eq: 1 } },
                      join: {
                          organizations: {
                              select: ['id', 'name']
                          }
                      }
                  }
              }
          }
      }
  } satisfies QueryInstance<Tables>
}

// Create DTO based on the query and generated from database tables
export type UsersQueryDTO = DTO<Tables, typeof findUserById>;

// Build query and Fetch data
const query = findUserById({ userId: 1 });
fetch('https://api.example.com/api',
    { method: 'POST', body: JSON.stringify({ query }) })
    .then(response => response.json())
    .then((result: usersQueryDTO) => {
        result.users.forEach(user => {
            console.log("Users email:", user.email)
        })
    })
```

Thanks to the DTO type helper, developers get full autocompletion and static type checking.

<img width="804" height="200" alt="autopomletition" src="https://github.com/user-attachments/assets/f3845934-55d6-4a4c-8f4f-f5218f360ffa" />

You'll see that it's not possible to make mistakes, because the query must satisfy the database schema due to generated types and the special `QueryInstance` type.

<img width="612" height="171" alt="not_existing_field" src="https://github.com/user-attachments/assets/862b14bb-b977-4b26-903c-528241d635f6" />

The backend receives the query and converts it to a SQL query like this. You won't need to deal with it — it happens under the hood automatically.

```sql
WITH users AS (
    SELECT
        users.id,
        users.email
    FROM users
    WHERE users.id = 1
)
SELECT
    users.id AS users__id,
    users.email AS users__email,
    users_organizations.id AS users_organizations__id,
    users_organizations.organization_id AS users_organizations__organization_id,
    organizations.id AS organizations__id,
    organizations.name AS organizations__name
FROM users
LEFT JOIN users_organizations
    ON users_organizations.user_id = users.id
    AND users_organizations.organization_id = 1
LEFT JOIN organizations
    ON users_organizations.organization_id = organizations.id
WHERE users.id IN (SELECT id FROM users)
```

The backend returns the following JSON with hierarchically organized data.

```json
{
  "users": [
    {
      "id": 1,
      "email": "john.doe@example.com",
      "users_organizations": [
        {
          "id": 1,
          "organization_id": 1,
          "organizations": [
            {
              "id": 1,
              "name": "Default"
            }
          ]
        }
      ]
    }
  ]
}
```

## Caveats

Use naming conventions as shown in the example. Always add "id" and foreign key "id" columns to the select array.

## Conclusion

<img width="320" height="320" alt="hamster" src="https://github.com/user-attachments/assets/923cb6d7-5237-4eda-967d-290e098e118c" />

Add the generate script before the TypeScript transpiler, and no one can break the code with type mismatches!

## License

GPL License
