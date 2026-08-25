using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using PayPalCheckoutSdk.Core;
using PayPalHttp;

namespace QueDetallito.Handlers
{
    public class PaypalClient
    {
        private readonly AppSettings _config;
        public PaypalClient(IOptions<AppSettings> config)
        {
            _config = config.Value;
        }
        public static PayPalEnvironment Environment()
        {
            return new SandboxEnvironment("AUjb7BhUXu-Fe7UkIAHUN5pHBA3rxOEN7m-oN2jKqBC4O5DFfm_sIHyzYOGufcznxQZPfYUM9owOzyA8",
                "EHI21hB3KQoqWUcYtgayMRA6LqfIOdOWUTyO4UjTXabpKITTrs8EAQ55_Pna5NNptmLhg0Ck-LIgvEvm");
        }

        public static HttpClient Client()
        {
            return new PayPalHttpClient(Environment());
        }

        public static HttpClient Client(string refreshToken)
        {
            return new PayPalHttpClient(Environment(), refreshToken);
        }

        public static string ObjectToJSONString(object serializableObject)
        {
            MemoryStream memoryStream = new MemoryStream();
            var writer = JsonReaderWriterFactory.CreateJsonWriter(memoryStream, Encoding.UTF8, true, true, "  ");
            DataContractJsonSerializer ser = new DataContractJsonSerializer(serializableObject.GetType(),
                new DataContractJsonSerializerSettings { UseSimpleDictionaryFormat = true });
            ser.WriteObject(writer, serializableObject);
            memoryStream.Position = 0;
            StreamReader sr = new StreamReader(memoryStream);
            return sr.ReadToEnd();
        }
    }
}
