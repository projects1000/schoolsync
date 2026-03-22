import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoCollection;
import org.bson.Document;

public class CheckStudents {
    public static void main(String[] args) {
        String uri = "mongodb+srv://chlokeshreddy20:bMRwMCOYIwoCYp3e@cluster0.r0o4pin.mongodb.net/playschool?appName=Cluster0";
        try (MongoClient mongoClient = MongoClients.create(uri)) {
            MongoDatabase database = mongoClient.getDatabase("playschool");
            MongoCollection<Document> collection = database.getCollection("students");
            System.out.println("Total Students: " + collection.countDocuments());
            
            Document first = collection.find().first();
            if (first != null) {
                System.out.println("Sample Student: " + first.toJson());
            } else {
                System.out.println("No students found.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
