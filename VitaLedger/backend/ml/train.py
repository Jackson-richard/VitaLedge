import numpy as np
from sklearn.linear_model import LogisticRegression
import pickle
import os

X_dummy = np.array([
    [25, 22.5, 110, 90],
    [45, 28.0, 130, 105],
    [65, 32.5, 150, 140],
    [30, 24.0, 115, 95],
    [55, 30.0, 140, 120],
    [22, 20.0, 100, 85],
    [70, 35.0, 160, 160]
])
y_dummy = np.array([0, 0, 1, 0, 1, 0, 1])

def train_and_save_model():
    model = LogisticRegression()
    model.fit(X_dummy, y_dummy)
    
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    with open(os.path.join(os.path.dirname(__file__), "risk_model.pkl"), "wb") as f:
        pickle.dump(model, f)
    print("Dummy model trained and saved to risk_model.pkl")

if __name__ == "__main__":
    train_and_save_model()
