from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/members')
def members():
  return {"members": ["Alice", "Bob", "Charlie"]}

if __name__ == '__main__':
  app.run(debug=True)