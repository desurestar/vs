Реализовать приложение, позволяющее добавлять, извлекать и удалять 
изображения из базы данных SQLite. Для хранения изображений необходимо 
использовать тип BLOB.
2. БД таким образом, чтобы в ней хранились данные типов : INTEGER, REAL, 
TEXT и BLOB. При этом также реализовать хранение даты и значений да/нет.
3. Модифицировать приложение, чтобы была возможность вносить записи, 
содержание данные типов, которые есть в БД.
4. В приложении реализовать Обработчик ошибок, который обрабатывает, 
например, ошибку подключения к БД. Реализовать логирование ошибок.
5. Подключение/отключение от СУБД реализовать в отдельном классе
using System;
using System.Data.SQLite;
using System.Drawing;
using System.IO;

namespace ImageDatabaseApp
{
    class Program
    {
        static string connectionString = "Data Source=images.db;Version=3;";

        static void Main(string[] args)
        {
            CreateDatabase();
            string imagePath = "path_to_your_image.jpg";

            // Добавить изображение
            AddImage(imagePath);

            // Извлечь изображение
            Image retrievedImage = GetImage(1);
            retrievedImage.Save("retrieved_image.jpg");

            // Удалить изображение
            DeleteImage(1);

            Console.WriteLine("Операции завершены.");
        }

        // Метод для создания базы данных и таблицы, если они не существуют
        static void CreateDatabase()
        {
            using (SQLiteConnection conn = new SQLiteConnection(connectionString))
            {
                conn.Open();
                string sql = @"CREATE TABLE IF NOT EXISTS Images (
                               Id INTEGER PRIMARY KEY AUTOINCREMENT,
                               ImageData BLOB NOT NULL)";
                using (SQLiteCommand cmd = new SQLiteCommand(sql, conn))
                {
                    cmd.ExecuteNonQuery();
                }
            }
        }

        // Метод для добавления изображения в базу данных
        static void AddImage(string imagePath)
        {
            byte[] imageData = File.ReadAllBytes(imagePath);
            using (SQLiteConnection conn = new SQLiteConnection(connectionString))
            {
                conn.Open();
                string sql = "INSERT INTO Images (ImageData) VALUES (@ImageData)";
                using (SQLiteCommand cmd = new SQLiteCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@ImageData", imageData);
                    cmd.ExecuteNonQuery();
                }
            }
        }

        // Метод для извлечения изображения из базы данных
        static Image GetImage(int id)
        {
            using (SQLiteConnection conn = new SQLiteConnection(connectionString))
            {
                conn.Open();
                string sql = "SELECT ImageData FROM Images WHERE Id = @Id";
                using (SQLiteCommand cmd = new SQLiteCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@Id", id);
                    byte[] imageData = (byte[])cmd.ExecuteScalar();

                    if (imageData != null)
                    {
                        using (MemoryStream ms = new MemoryStream(imageData))
                        {
                            return Image.FromStream(ms);
                        }
                    }
                    else
                    {
                        Console.WriteLine("Изображение с указанным Id не найдено.");
                        return null;
                    }
                }
            }
        }

        // Метод для удаления изображения из базы данных
        static void DeleteImage(int id)
        {
            using (SQLiteConnection conn = new SQLiteConnection(connectionString))
            {
                conn.Open();
                string sql = "DELETE FROM Images WHERE Id = @Id";
                using (SQLiteCommand cmd = new SQLiteCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@Id", id);
                    int rowsAffected = cmd.ExecuteNonQuery();
                    if (rowsAffected > 0)
                    {
                        Console.WriteLine("Изображение удалено.");
                    }
                    else
                    {
                        Console.WriteLine("Изображение с указанным Id не найдено.");
                    }
                }
            }
        }
    }
}