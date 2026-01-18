import { ref } from 'vue';
import { useApolloClient } from '@vue/apollo-composable';
import { GET_USERS, CREATE_USER, DELETE_USER, UPDATE_USER } from '../graphql/users';

export interface User {
  id: string;
  name: string;
  email: string;
}

export function useUserStore() {
  const { client } = useApolloClient();

  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchUsers() {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await client.query({
        query: GET_USERS,
        fetchPolicy: 'network-only',
      });

      console.log("SERVER DATA:", data); // ← HIER
      console.log("IST ARRAY?", Array.isArray(data.users));
      console.log("RAW USERS:", data.users);

      // 🔥 readonly Proxy → echtes Array erzeugen
     users.value = data.users.map((u: User) => ({ ...u }));
    } catch (err: any) {
      error.value = err.message ?? 'Fehler beim Laden der Benutzer';
    } finally {
      loading.value = false;
    }
  }

  async function createUser(name: string, email: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await client.mutate({
        mutation: CREATE_USER,
        variables: { name, email },
        update(cache, { data }) {
          const newUser = data?.createUser;
          if (!newUser) return;

          const existing: any = cache.readQuery({ query: GET_USERS });

          cache.writeQuery({
            query: GET_USERS,
            data: {
              users: existing?.users
                ? [...existing.users, newUser]
                : [newUser],
            },
          });
        },
      });

      if (data?.createUser) {
        // 🔥 wichtig: Vue‑Array mutieren, nicht Apollo‑Proxy
        users.value = [...users.value, data.createUser];
      }
    } catch (err: any) {
      error.value = err.message ?? 'Fehler beim Erstellen des Benutzers';
    } finally {
      loading.value = false;
    }
  }

  async function deleteUser(id: string) {
    loading.value = true;
    error.value = null;

    try {
      await client.mutate({
        mutation: DELETE_USER,
        variables: { id },
        update(cache) {
          const existing: any = cache.readQuery({ query: GET_USERS });
          if (!existing?.users) return;

          const filtered = existing.users.filter((u: User) => u.id !== id);

          cache.writeQuery({
            query: GET_USERS,
            data: { users: filtered },
          });
        },
      });

      // 🔥 Vue‑State aktualisieren
      users.value = users.value.filter((u) => u.id !== id);
    } catch (err: any) {
      error.value = err.message ?? 'Fehler beim Löschen des Benutzers';
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(id: string, name: string, email: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await client.mutate({
        mutation: UPDATE_USER,
        variables: {
          id,
          input: {
            name,
            email
          }
        },
        update(cache, { data }) {
          const updated = data?.updateUser;
          if (!updated) return;

          const existing: any = cache.readQuery({ query: GET_USERS });
          if (!existing?.users) return;

          const newList = existing.users.map((u: User) =>
            u.id === id ? updated : u
          );

          cache.writeQuery({
            query: GET_USERS,
            data: { users: newList },
          });
        },
      });

      if (data?.updateUser) {
        users.value = users.value.map((u) =>
          u.id === id ? data.updateUser : u
        );
      }
    } catch (err: any) {
      error.value = err.message ?? 'Fehler beim Aktualisieren des Benutzers';
    } finally {
      loading.value = false;
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    deleteUser,
    updateUser,
  };
}
