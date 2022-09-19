from time import time
from unicodedata import name
import requests
from bs4 import BeautifulSoup

# ------------------- READ_TXT ------------------- #
def read_csv(path, max_lines=None):
       
    with open(path, 'r') as f:
        cont = 0
        lines = f.readlines()[1:]
        for line in lines:
            if (cont == max_lines):
                return
            tab = line.split('\t')
            #print(tab)
            # ------------------Evitamos las url en blanco. Es \n porque es el último término antes de un salto de linea.------------------ #
            if tab[4] == '\n':
                continue
            url = tab[4]
            #print(url)
            # ------------------Evitamos el salto de linea.------------------ #
            c_url = url[:-1]
            #print(c_url)
            
            data = getDataFromUrl(c_url)
            
            if data is not None:
                print(f'[{cont}] {data["url"]}\n Title: {repr(data["title"])}\n Description: {repr(data["description"])}\n Keywords: {repr(data["keywords"])}')
                cont += 1
            
    return 

# ------------------- SCRAPING ------------------- #
def getDataFromUrl(url):
    collected_data = {'url': url, 'title': None, 'description': None, 'keywords': None}
    try:
        r = requests.get(url, timeout=1)
    except Exception:
        return None

    if r.status_code == 200:
        
        # Se puede usar BeautifulSoap u otra librería que parsee la metadata de los docuementos HTML.
        source = requests.get(url).text
        soup = BeautifulSoup(source, features='html.parser')

        # Se otienes las etiquetas meta
        meta = soup.find("meta")
            
        # Obtenemos el título
        title = soup.find("meta", {'name': 'title'})
        #title = title['content'] if title else None
        
        # Obtenemos la descripción
        description = soup.find("meta", {'name': "description"})
        #description = description['content'] if description else None
        
        # Obtenemos la keywords y las limpiamos
        keywords = soup.find("meta", {'name': "keywords"})
        #keywords = keywords['content'] if keywords else None
        
        i=0
        try:
            if keywords is None:
                return None
            else:
                
                title = title['content'] if title else None
                description = description['content'] if description else None
                keywords = keywords['content'] if keywords else None
                
                keywords = keywords.replace(" ", "") if keywords else None
                keywords = keywords.replace(".", "") if keywords else None
                keywords = keywords.split(",") if keywords else None  
                with open('init.sql','w') as db:

                    db.write('INSERT INTO URLs(id,title,description,keywords,url) VALUES(')
                    db.write(i)
                    db.write(',')
                    db.write(title)
                    db.write(',')
                    db.write(description)
                    db.write(',')
                    db.write(keywords)
                    db.write(',')
                    db.write(source)
                    db.write(')')
                    db.writelines('\n')
                    db.close()   
                i+=1
        except Exception:
            return None
        collected_data['title'] = title
        collected_data['description'] = description
        collected_data['keywords'] = keywords 
        if collected_data['keywords'] is None:
                return None
        return collected_data
        

    return None


# ------------------- MAIN ------------------- #
if __name__ == '__main__':
    with open ('init.sql', 'w') as db:
        db.write('CREATE TABLE items(id INT, title VARCHAR(300), description VARCHAR(1000), keywords VARCHAR(1000), url VARCHAR(200))')
        db.writelines('\n')
        db.close()
    path = './user-ct-test-collection-09.txt'
    read_csv(path, 100)