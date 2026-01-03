from flask import Flask, request, render_template
import pandas as pd

app = Flask(__name__)


@app.route('/')
def home():
    return render_template("index.html")


@app.route('/project')
def project_home():
    return render_template("FinalProjectHome.html")

@app.route('/project/data')
def project_data():
    return render_template("FinalProjectData.html")

@app.route('/project/results')
def project_results():
    return render_template("FinalProjectResult.html")


@app.route('/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    brand = request.args.get('brand')
    sort = request.args.get('sort')

    return {
        "category": category,
        "brand": brand,
        "sort": sort
    }

@app.route('/login', methods=['POST','GET'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        return {
            "username": username,
            "password": password
        }

    return render_template("index.html")


data = {
    "fiction": ["Lord of the Rings", "Narnia", "Hunger Games", "Percy Jackson"],
    "correlation": [0.92, 0.85, 0.63, 0.77]
}

df = pd.DataFrame(data)

@app.route('/results', methods=['GET', 'POST'])
def search():
    user_input = (request.form.get('book_name') or "").lower()

    if user_input == "harry potter":
        results = df.to_dict('records')
        return render_template("results.html", results=results, book=user_input)
    else:
        return render_template("results.html", error="Book not found.")


if __name__ == '__main__':
    app.run(debug=True)
