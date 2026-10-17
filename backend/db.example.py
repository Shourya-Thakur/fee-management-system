import pymysql
import config

def get_connection():
    return pymysql.connect(
        host=config.MYSQL_HOST,
        user=config.MYSQL_USER,
        password=config.MYSQL_PASSWORD,
        database=config.MYSQL_DB,
        cursorclass=pymysql.cursors.DictCursor
    )
