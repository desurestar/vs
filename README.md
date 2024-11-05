using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Data.SQLite;
using System.IO;
using System.Diagnostics;


namespace WindowsFormsApp1
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            if (!File.Exists(@"C:\temp\TestDBSQLite1.db")) // если базы данных нету, то создать БД
            {
                SQLiteConnection.CreateFile(@"C:\temp\TestDBSQLite1.db"); // создать базу данных, по указанному пути содаётся пустой файл базы данных
                MessageBox.Show("База данных создана");

}
        }

        private void buttonTable_Click(object sender, EventArgs e)
        {
            using (SQLiteConnection Connect = new SQLiteConnection(@"Data Source=C:\temp\TestDBSQLite1.db; Version=3;")) // в строке указывается к какой базе подключаемся
            {
                // строка запроса, который надо будет выполнить
                string commandText = "CREATE TABLE IF NOT EXISTS ["+textBox1.Text+"] ( [id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, [image] BLOB, [image_format] VARCHAR(10), " +
                    "[image_name] NVARCHAR(128), [file] BINARY, [file_format] VARCHAR(10), [file_name] NVARCHAR(128))"; // создать таблицу, если её нет
                SQLiteCommand Command = new SQLiteCommand(commandText, Connect);
                Connect.Open(); // открыть соединение
                Command.ExecuteNonQuery(); // выполнить запрос
                Connect.Close(); // закрыть соединение
                MessageBox.Show("Таблица "+textBox1.Text+" в базе данных создана");
            }
        }

        private void buttonSelect_Click(object sender, EventArgs e)
        {
            using (SQLiteConnection Connect = new SQLiteConnection(@"Data Source=C:\temp\TestDBSQLite1.db; Version=3;")) // в строке указывается к какой базе подключаемся
            {
                // строка запроса, который надо будет выполнить
                string commandText = "Select * from NewTable"; 
                SQLiteCommand Command = new SQLiteCommand(commandText, Connect);
                Connect.Open(); // открыть соединение
                SQLiteDataReader sqlReader = Command.ExecuteReader(); // выполнить запрос
                                
                DataTable dt = new DataTable();
                dt.Load(sqlReader);
                dataGridView1.DataSource = dt;

                Connect.Close(); // закрыть соединение
            }
        }

        private void button1_Click_1(object sender, EventArgs e)
        {
            // Конвертируем изображение в байты byte[]
            string imgPath = @"C:\temp\image.jpg"; // изображение
            FileInfo _imgInfo = new FileInfo(imgPath);
            long _numBytes = _imgInfo.Length;
            FileStream _fileStream = new FileStream(imgPath, FileMode.Open, FileAccess.Read); // читаем изображение
            BinaryReader _binReader = new BinaryReader(_fileStream);
            byte[] _imageBytes = _binReader.ReadBytes((int)_numBytes); // изображение в байтах
            string imgFormat = Path.GetExtension(imgPath).Replace(".", "").ToLower(); // запишем в переменную расширение изображения в нижнем регистре, не забыв удалить точку перед расширением, получим «png»
            string imgName = Path.GetFileName(imgPath).Replace(Path.GetExtension(imgPath), ""); // запишем в переменную имя файла, не забыв удалить расширение с точкой, получим «image-01»
                                                                                                // записываем информацию в базу данных
            using (SQLiteConnection Connect = new SQLiteConnection(@"Data Source=C:\temp\TestDBSQLite1.db; Version=3;"))
            {
                // в запросе есть переменные, они начинаются на @, обратите на это внимание
                string commandText = "INSERT INTO ["+textBox1.Text+"] ([image], [image_format], [image_name]) VALUES(@image, @format, @name)";
                SQLiteCommand Command = new SQLiteCommand(commandText, Connect);
                Command.Parameters.AddWithValue("@image", _imageBytes); // присваиваем переменной значение
                Command.Parameters.AddWithValue("@format", imgFormat);
                Command.Parameters.AddWithValue("@name", imgName);
                Connect.Open();
                Command.ExecuteNonQuery();
                Connect.Close();
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {
            // получаем данные их БД
            // сделав запрос к БД мы получим множество строк в ответе, поэтому мы их записываем в массивы/List
            List<byte[]> _imageList = new List<byte[]>(); // изображение в байтах
            List<string> _imgFormatList = new List<string>(); // расширения изображений
            using (SQLiteConnection Connect = new SQLiteConnection(@"Data Source=C:\temp\TestDBSQLite1.db; Version=3;"))
            {
                Connect.Open();
                SQLiteCommand Command = new SQLiteCommand
                {
                    Connection = Connect,
                    CommandText = @"SELECT * FROM [" + textBox1.Text + "] WHERE [image_format] NOT NULL" // выборка записей с заполненной ячейкой формата изображения, можно другой запрос составить
                };
                SQLiteDataReader sqlReader = Command.ExecuteReader();
                byte[] _dbImageByte = null;
                string _dbImageFormat = null;
                while (sqlReader.Read()) // считываем и вносим в лист все параметры
                {
                    _dbImageByte = (byte[])sqlReader["image"]; // читаем строки с изображениями, которые хранятся в байтовом формате
                    _imageList.Add(_dbImageByte); // добавляем в List
                    _dbImageFormat = sqlReader["image_format"].ToString().TrimStart().TrimEnd(); // читаем строки с форматом изображений
                    _imgFormatList.Add(_dbImageFormat); // добавляем в List
                }
                Connect.Close();
            }
            if (_imageList.Count == 0) // если в базе нет записей с изображениями (пустой список), то...
            {
                return; // завершить работу метода
            }
            // конвертируем бинарные данные в изображение
            byte[] _imageBytes = _imageList[0]; // так как SQLite вернёт список изображений из БД, то из листа берём первое с индексом '0'
            MemoryStream ms = new MemoryStream(_imageBytes);
            Image _newImg = Image.FromStream(ms);
            pictureBox1.Image = _newImg;
            // сохраняем изоражение на диск
            string _imgFormat = _imgFormatList[0]; // получаем расширение текущего изображения хранящееся в БД
            string _newImageSaved = @"C:\temp\image_new." + _imgFormat; // задаём путь сохранения и имя нового изображения
            if (_imgFormat == "jpeg" || _imgFormat == "jpg") // если расширение равно указанному, то...
                _newImg.Save(_newImageSaved, System.Drawing.Imaging.ImageFormat.Jpeg); // задаём указанный формат: ImageFormat
            else if (_imgFormat == "png")
                _newImg.Save(_newImageSaved, System.Drawing.Imaging.ImageFormat.Png);
            else if (_imgFormat == "bmp")
                _newImg.Save(_newImageSaved, System.Drawing.Imaging.ImageFormat.Bmp);
            else if (_imgFormat == "gif")
                _newImg.Save(_newImageSaved, System.Drawing.Imaging.ImageFormat.Gif);
            else if (_imgFormat == "ico")
                _newImg.Save(_newImageSaved, System.Drawing.Imaging.ImageFormat.Icon);
            else if (_imgFormat == "tiff" || _imgFormat == "tif")
                _newImg.Save(_newImageSaved, System.Drawing.Imaging.ImageFormat.Tiff);
            // и т.д., можно все if заменить на одну строку "_newImg.Save(_newImageSaved)", насколько это правильно сказать не могу, но работает
        }

        private void button3_Click(object sender, EventArgs e)
        {
            // Конвертируем файл в байты byte[]
            byte[] _fileBytes = null;
            string filePath = @"C:\temp\Транзакции.pptx"; // файл
            FileInfo _fileInfo = new FileInfo(filePath);
            long _numBytes = _fileInfo.Length;
            FileStream _fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read); // откроем файл на чтение
            BinaryReader _binReader = new BinaryReader(_fileStream);
            _fileBytes = File.ReadAllBytes(filePath);
            string fileFormat = Path.GetExtension(filePath).Replace(".", "").ToLower(); // запишем в переменную расширение файла в нижнем регистре, не забыв удалить точку перед расширением
            string fileName = Path.GetFileName(filePath).Replace(Path.GetExtension(filePath), ""); // запишем в переменную имя файла, не забыв удалить расширение с точкой, получим Имя Файла
                                                                                                   // записываем информацию в базу данных
            using (SQLiteConnection Connect = new SQLiteConnection(@"Data Source=C:\temp\TestDBSQLite1.db; Version=3;"))
            {
                string commandText = "INSERT INTO [" + textBox1.Text + "] ([file], [file_format], [file_name]) VALUES(@file, @format, @name)";
                SQLiteCommand Command = new SQLiteCommand(commandText, Connect);
                Command.Parameters.AddWithValue("@file", _fileBytes);
                Command.Parameters.AddWithValue("@format", fileFormat);
                Command.Parameters.AddWithValue("@name", fileName);
                Connect.Open();
                Command.ExecuteNonQuery();
                Connect.Close();
            }
        }

        private void button4_Click(object sender, EventArgs e)
        {
            using (SQLiteConnection Connect = new SQLiteConnection(@"Data Source=C:\temp\TestDBSQLite1.db; Version=3;"))
            {
                string commandText = "DELETE FROM ["+ textBox1.Text+"] WHERE [id] = @id"; // LIMIT в SQLite аналог TOP в MS SQL
                SQLiteCommand Command = new SQLiteCommand(commandText, Connect);
                Command.Parameters.AddWithValue("@dbTableName", textBox1.Text);
                Command.Parameters.AddWithValue("@id", Convert.ToInt16(textBoxDeleteId.Text));
                Connect.Open();
                // Command.ExecuteNonQuery(); // можно эту строку вместо двух последующих строк
                Int32 _rowsUpdate = Command.ExecuteNonQuery(); // sql возвращает сколько строк обработано
                MessageBox.Show("Удалено строк: " + _rowsUpdate);
                Connect.Close();
            }
        }

        private void button5_Click(object sender, EventArgs e)
        {
            using (SQLiteConnection Connect = new SQLiteConnection(@"Data Source=C:\temp\TestDBSQLite1.db; Version=3;"))
            {
                string commandText = "UPDATE [" + textBox1.Text + "] SET [file_name] = @value WHERE [id] = @id";
                SQLiteCommand Command = new SQLiteCommand(commandText, Connect);
                Command.Parameters.AddWithValue("@value", "Новое имя файла");
                Command.Parameters.AddWithValue("@id", Convert.ToInt16(textBoxDeleteId.Text));
                Connect.Open();
                // Command.ExecuteNonQuery(); // можно эту строку вместо двух последующих строк
                Int32 _rowsUpdate = Command.ExecuteNonQuery(); // sql возвращает сколько строк обработано
                MessageBox.Show("Обновлено строк: " + _rowsUpdate);
                Connect.Close();
            }
        }

        private void button6_Click(object sender, EventArgs e)
        {
            //С помощью кода добавления и извлечения файла можно писать и
            //считывать из базы данных любые файлы включая изображения.

            // получаем данные их БД
            List<byte[]> _fileList = new List<byte[]>();
            List<string> _fileFormatList = new List<string>();
            using (SQLiteConnection Connect = new SQLiteConnection(@"Data Source=C:\temp\TestDBSQLite1.db; Version=3;"))
            {
                Connect.Open();
                SQLiteCommand Command = new SQLiteCommand
                {
                    Connection = Connect,
                    CommandText = @"SELECT * FROM [" + textBox1.Text + "] WHERE [file_format] NOT NULL"
                };
                SQLiteDataReader sqlReader = Command.ExecuteReader();
                byte[] _dbFileByte = null;
                string _dbFileFormat = null;
                while (sqlReader.Read())
                {
                    _dbFileByte = (byte[])sqlReader["file"];
                    _fileList.Add(_dbFileByte);
                    _dbFileFormat = sqlReader["file_format"].ToString().TrimStart().TrimEnd();
                    _fileFormatList.Add(_dbFileFormat);
                }
                Connect.Close();
            }
            if (_fileList.Count == 0) // если в базе нет записей с файлами (пустой список), то...
            {
                return; // завершить работу метода
            }
            // сохранить файл на диск
            byte[] _fileBytes = _fileList[0]; // получаем массив байтов файла, который в БД (первый из списка)
            string _fileFormat = _fileFormatList[0]; // получаем расширение файла (первый из списка)
            string _newFileSaved = @"C:\temp\Транзакции_new.pptx." + _fileFormat; // задаём путь сохранения файла с именем и расширение
            FileStream fileStream = new FileStream(_newFileSaved, FileMode.Create, FileAccess.ReadWrite);
            BinaryWriter binWriter = new BinaryWriter(fileStream);
            binWriter.Write(_fileBytes);
            binWriter.Close();
        }

        private void dataGridView1_CellContentClick(object sender, DataGridViewCellEventArgs e)
        {

        }
    }
}
