import os
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import joblib

def generate_synthetic_training_data(n_samples=2500, random_state=42):
    rng = np.random.RandomState(random_state)
    # Distance between 0.2 km and 35.0 km
    distances = rng.uniform(0.2, 35.0, size=n_samples)
    # Types: 0: BASIC, 1: ADVANCED, 2: ICU, 3: PATIENT_TRANSPORT
    types = rng.randint(0, 4, size=n_samples)
    # Hours 0-23
    hours = rng.randint(0, 24, size=n_samples)

    etas = []
    for d, t, h in zip(distances, types, hours):
        is_rush = 1 if (7 <= h <= 10 or 16 <= h <= 20) else 0
        speed = 34.0 - (6.0 * is_rush) + (2.5 if t in [1, 2] else 0.0)
        noise = rng.normal(0, 1.2)
        eta = 2.0 + (d / speed) * 60.0 + noise
        etas.append(max(2.0, eta))

    X = np.column_stack([distances, types, hours])
    y = np.array(etas)
    return X, y

def train_and_save_model():
    X, y = generate_synthetic_training_data()
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42))
    ])
    pipeline.fit(X, y)

    model_path = os.path.join(os.path.dirname(__file__), "eta_model.joblib")
    joblib.dump(pipeline, model_path)
    print(f"Successfully trained and saved ETA ML model to: {model_path}")
    return model_path

if __name__ == "__main__":
    train_and_save_model()
