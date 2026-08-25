using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Data
{
    public interface IDatabaseConnection
    {
        Task<IDbConnection> CreateConnectionAsync();
    }
    public class DatabaseConnection : IDatabaseConnection
    {
        private readonly string _connection;
        public DatabaseConnection(string connection) => _connection = connection ?? throw new ArgumentNullException(nameof(connection));
        public async Task<IDbConnection> CreateConnectionAsync()
        {
            var sqlConnection = new SqlConnection(_connection);
            await sqlConnection.OpenAsync();
            return sqlConnection;
        }
    }
}
