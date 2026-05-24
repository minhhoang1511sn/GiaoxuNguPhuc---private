using DotNetEnv;
using MySqlConnector;
using System.Data;

namespace GiaoxuNguPhucBE.Config
{
    public static class ConnectDB
    {
        static ConnectDB()
        {
            Env.Load(); // load .env 1 lần
        }

        private static string ConnectionString =>
            $"Server={Environment.GetEnvironmentVariable("DB_HOST")};" +
            $"Port={Environment.GetEnvironmentVariable("DB_PORT")};" +
            $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
            $"User={Environment.GetEnvironmentVariable("DB_USER")};" +
            $"Password={Environment.GetEnvironmentVariable("DB_PASS")};";

        private static MySqlConnection GetConnection()
        {
            return new MySqlConnection(ConnectionString);
        }

        // ================= INSERT / UPDATE / DELETE =================
        public static int ExecuteNonQuery(string sql, Dictionary<string, object>? parameters = null)
        {
            using var conn = GetConnection();
            conn.Open();

            using var cmd = new MySqlCommand(sql, conn);

            if (parameters != null)
            {
                foreach (var p in parameters)
                {
                    cmd.Parameters.AddWithValue(p.Key, p.Value);
                }
            }

            return cmd.ExecuteNonQuery(); // số dòng bị ảnh hưởng
        }

        // ================= SELECT =================
        public static DataTable ExecuteQuery(string sql, Dictionary<string, object>? parameters = null)
        {
            using var conn = GetConnection();
            conn.Open();

            using var cmd = new MySqlCommand(sql, conn);

            if (parameters != null)
            {
                foreach (var p in parameters)
                {
                    cmd.Parameters.AddWithValue(p.Key, p.Value);
                }
            }

            using var reader = cmd.ExecuteReader();
            var table = new DataTable();
            table.Load(reader);
            return table;
        }
    }
}
