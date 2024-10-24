
---

### Testing the Optimize Endpoint

To ensure that the `optimize` endpoint is functioning correctly, you can perform a test by sending a **POST** request with the required payload. Below is an example of how to structure your request and the expected response.

#### **Endpoint:**

```
POST {{baseUrl}}/optimize/
Content-Type: application/json
```

#### **Request Payload:**

```json
{
  "data": [
    {"feature1": 1.0, "feature2": 2.0, "target": 3.0},
    {"feature1": 4.0, "feature2": 5.0, "target": 6.0},
    {"feature1": 14.0, "feature2": 15.0, "target": 16.0}
  ],
  "features": ["feature1", "feature2"],
  "target": "target",
  "target_value": 4.5,
  "pso_config": {
    "lb": [0, 0],
    "ub": [10, 10],
    "swarmsize": 50,
    "omega": 0.5,
    "phip": 1.5,
    "phig": 1.5,
    "maxiter": 10,
    "n_solutions": 10,
    "nprocessors": 4,
    "max_rounds": 10,
    "debug_flag": false
  }
}
```

**Explanation of Request Fields:**

- **`data`**: An array of objects representing your dataset. Each object contains feature values and the target value.
  
- **`features`**: A list of feature column names to be used for optimization.
  
- **`target`**: The name of the target column in your dataset.
  
- **`target_value`**: The desired prediction value (`Epsilon`) that the PSO algorithm will aim to achieve.
  
- **`pso_config`**: Configuration settings for the Particle Swarm Optimization (PSO) algorithm.
  - **`lb`**: Lower bounds for each feature during optimization.
  - **`ub`**: Upper bounds for each feature during optimization.
  - **`swarmsize`**: Number of particles in the swarm.
  - **`omega`**: Inertia weight parameter.
  - **`phip`**: Cognitive parameter.
  - **`phig`**: Social parameter.
  - **`maxiter`**: Maximum number of iterations.
  - **`n_solutions`**: Number of optimal solutions to return.
  - **`nprocessors`**: Number of processors to use for parallel optimization.
  - **`max_rounds`**: Maximum number of optimization rounds.
  - **`debug_flag`**: Boolean flag to enable or disable debug mode.

#### **Sample Response:**

```json
{
  "best_model": "Lasso Regression",
  "best_runtime": 7.591476917266846,
  "best_fopt": 5.918770702587987e-06,
  "best_solution": [
    {
      "Pred_feature1": 2.2291389224289984,
      "Pred_feature2": 7.443543984158763,
      "Pred_Epsilon": 4.499973365531838,
      "Pred_% Error": 5.918770702587987e-06,
      "Epsilon": 4.5
    },
    {
      "Pred_feature1": 2.22910081260621,
      "Pred_feature2": 1.414193554618039,
      "Pred_Epsilon": 4.499936780101962,
      "Pred_% Error": 1.4048866230748697e-05,
      "Epsilon": 4.5
    },
    {
      "Pred_feature1": 2.2292427795745016,
      "Pred_feature2": 5.446662730407732,
      "Pred_Epsilon": 4.500073068391522,
      "Pred_% Error": 1.6237420338269556e-05,
      "Epsilon": 4.5
    },
    {
      "Pred_feature1": 2.2290900239265348,
      "Pred_feature2": 7.5652460219550655,
      "Pred_Epsilon": 4.499926422969474,
      "Pred_% Error": 1.6350451228003886e-05,
      "Epsilon": 4.5
    },
    {
      "Pred_feature1": 2.229284396844167,
      "Pred_feature2": 2.6454087549112777,
      "Pred_Epsilon": 4.5001130209704,
      "Pred_% Error": 2.5115771200074415e-05,
      "Epsilon": 4.5
    },
    {
      "Pred_feature1": 2.228759044698364,
      "Pred_feature2": 8.016020023250352,
      "Pred_Epsilon": 4.49960868291043,
      "Pred_% Error": 8.695935323781928e-05,
      "Epsilon": 4.5
    },
    {
      "Pred_feature1": 2.2296755523926737,
      "Pred_feature2": 10.0,
      "Pred_Epsilon": 4.500488530296967,
      "Pred_% Error": 0.00010856228821489979,
      "Epsilon": 4.5
    },
    {
      "Pred_feature1": 2.229848793144363,
      "Pred_feature2": 7.454908636096683,
      "Pred_Epsilon": 4.500654841418589,
      "Pred_% Error": 0.00014552031524199074,
      "Epsilon": 4.5
    },
    {
      "Pred_feature1": 2.229854659558362,
      "Pred_feature2": 7.965347221646796,
      "Pred_Epsilon": 4.500660473176028,
      "Pred_% Error": 0.00014677181689511562,
      "Epsilon": 4.5
    },
    {
      "Pred_feature1": 2.230023753561798,
      "Pred_feature2": 0.014035296927467744,
      "Pred_Epsilon": 4.500822803419326,
      "Pred_% Error": 0.00018284520429467932,
      "Epsilon": 4.5
    }
  ],
  "comparison_table": {
    "feature1": {
      "Random Forest": 5.507979025745755,
      "Linear Regression": 0.6765948371201196,
      "Ridge Regression": 0.0,
      "Lasso Regression": 2.2291389224289984,
      "SVR": 3.8378603721506592,
      "Decision Tree": 6.977288245972709
    },
    "feature2": {
      "Random Forest": 7.081478226181048,
      "Linear Regression": 5.323597808171164,
      "Ridge Regression": 0.0,
      "Lasso Regression": 7.443543984158763,
      "SVR": 4.834795041618127,
      "Decision Tree": 2.160894955803764
    }
  },
  "graphs": {
    "png": "iVBORw0KGgoAAAANSUhEUgAAAoAAAAHgCAYAAAA10dzkAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjYuMywgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy/P9b71AAAACXBIWXMAAA9hAAAPYQGoP6dpAAB0RElEQVR4nO3dd1gUV9sG8HvpHSwgqHRQUQHBLvYGWGKvRAFbjIXYe8OGDQtq1GgCGsVeY1SCig17w4YNQbAnFhAQBHa+P/yY1xUswMIie/+ua65kzpw555lhlMczZ2YkgiAIICIiIiKloaLoAIiIiIioaDEBJCIiIlIyTACJiIiIlAwTQCIiIiIlwwSQiIiISMkwASQiIiJSMkwAiYiIiJQME0AiIiIiJcMEkIiIiEjJMAEkIiIiUjJMAImIiIiUDBNAIiIiIiXDBJCIiIhIyTABJCIiIlIyTACpUMTFxUEikSAkJETRodBnhISEQCKRICTwDr1KmDli1byiwAxL/kmzdvDmNjY5nln3/+kZkr9+rVK/zyyy8oV64ctLW1YWxsDGtrawAotLkv2e1nu3fvHgRBgL29fY54o6Ojc53b96nshzxCQ0MBAI8ePcLJkyfRs2dPMXmQSqVYsmQJ7O3toampibJly8LY2BjXrl2T27Heu3cPiYmJMDExyXEsycnJ4rE0adIEXbp0gb+/P8qWLYsOHTogODg4x7y6TxkYGADAF19787GHDx+icuXKOcodHBzE7R+zsLCQWc/+xWhubp6jXCqV5jhv9vb2OfqqVKkSUlNTxekC7969w7Rp08R5eNk/hzdv3uT6c/j0esnNt5zPhw8fonz58jmS5289FwBQqlSpb0qQNm7cCGtra2hqauL+/fu4f/8+bG1toaOjg02bNon1YmJiUL58eZQuXfqrbX56Hv7991+kpqZ+9ucrlUrFObQzZ87EmzdvUKlSJTg6OmLs2LG4du2aWF9TUxPz58/bGluazpocmVmPSIjRGVqYVZ1U2Fucy02OSIgeD0iNzM3LjE0NjQ4NCIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTZmIiB4PSI3NjQuOTI5Njg4Ii8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNmUiIHg9IjgyNi4xMTEzMjgiLz4KICAgICA8L2c+CiAgICA8L2c+CiAgICA8ZyBpZD0icGF0Y2hfMjIiPgogICAgIDxwYXRoIGQ9Ik0gMzI0LjUxNjIgODcuNTEyODEyIApMIDM0NC41MTYyIDg3LjUxMjgxMiAKTCAzNDQuNTE2MiA4MC41MTI4MTIgCkwgMzI0LjUxNjIgODAuNTEyODEyIAp6CiIgc3R5bGU9ImZpbGw6ICMyY2EwMmMiLz4KICAgIDwvZz4KICAgIDxnIGlkPSJ0ZXh0XzE3Ij4KICAgICA8IS0tIFJpZGdlIFJlZ3Jlc3Npb24gLS0+CiAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzUyLjUxNjIgODcuNTEyODEyKSBzY2FsZSgwLjEgLTAuMSkiPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTUyIi8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNjkiIHg9IjY5LjQ4MjQyMiIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTY0IiB4PSI5Ny4yNjU2MjUiLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy02NyIgeD0iMTYwLjc0MjE4OCIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTY1IiB4PSIyMjQuMjE4NzUiLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy0yMCIgeD0iMjg1Ljc0MjE4OCIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTUyIiB4PSIzMTcuNTI5Mjk3Ii8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNjUiIHg9IjM4Mi41MTE3MTkiLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy02NyIgeD0iNDQ0LjAzNTE1NiIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTcyIiB4PSI1MDcuNTExNzE5Ii8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNjUiIHg9IjU0Ni4zNzUiLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy03MyIgeD0iNjA3Ljg5ODQzOCIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTczIiB4PSI2NTkuOTk4MDQ3Ii8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNjkiIHg9IjcxMi4wOTc2NTYiLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy02ZiIgeD0iNzM5Ljg4MDg1OSIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTZlIiB4PSI4MDEuMDYyNSIvPgogICAgIDwvZz4KICAgIDwvZz4KICAgIDxnIGlkPSJwYXRjaF8yMyI+CiAgICAgPHBhdGggZD0iTSAzMjQuNTE2MiAxMDIuMTkwOTM4IApMIDM0NC41MTYyIDEwMi4xOTA5MzggCkwgMzQ0LjUxNjIgOTUuMTkwOTM4IApMIDMyNC41MTYyIDk1LjE5MDkzOCAKegoiIHN0eWxlPSJmaWxsOiAjZDYyNzI4Ii8+CiAgICA8L2c+CiAgICA8ZyBpZD0idGV4dF8xOCI+CiAgICAgPCEtLSBMYXNzbyBSZWdyZXNzaW9uIC0tPgogICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM1Mi41MTYyIDEwMi4xOTA5MzgpIHNjYWxlKDAuMSAtMC4xKSI+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNGMiLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy02MSIgeD0iNTUuNzEyODkxIi8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNzMiIHg9IjExNi45OTIxODgiLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy03MyIgeD0iMTY5LjA5MTc5NyIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTZmIiB4PSIyMjEuMTkxNDA2Ii8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtMjAiIHg9IjI4Mi4zNzMwNDciLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy01MiIgeD0iMzE0LjE2MDE1NiIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTY1IiB4PSIzNzkuMTQyNTc4Ii8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNjciIHg9IjQ0MC42NjYwMTYiLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy03MiIgeD0iNTA0LjE0MjU3OCIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTY1IiB4PSI1NDMuMDA1ODU5Ii8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNzMiIHg9IjYwNC41MjkyOTciLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy03MyIgeD0iNjU2LjYyODkwNiIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTY5IiB4PSI3MDguNzI4NTE2Ii8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNmYiIHg9IjczNi41MTE3MTkiLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy02ZSIgeD0iNzk3LjY5MzM1OSIvPgogICAgIDwvZz4KICAgIDwvZz4KICAgIDxnIGlkPSJwYXRjaF8yNCI+CiAgICAgPHBhdGggZD0iTSAzMjQuNTE2MiAxMTYuODY5MDYzIApMIDM0NC41MTYyIDExNi44NjkwNjMgCkwgMzQ0LjUxNjIgMTA5Ljg2OTA2MyAKTCAzMjQuNTE2MiAxMDkuODY5MDYzIAp6CiIgc3R5bGU9ImZpbGw6ICM5NDY3YmQiLz4KICAgIDwvZz4KICAgIDxnIGlkPSJ0ZXh0XzE5Ij4KICAgICA8IS0tIFNWUiAtLT4KICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzNTIuNTE2MiAxMTYuODY5MDYzKSBzY2FsZSgwLjEgLTAuMSkiPgogICAgICA8ZGVmcz4KICAgICAgIDxwYXRoIGlkPSJEZWphVnVTYW5zLTUzIiBkPSJNIDM0MjUgNDUxMyAKTCAzNDI1IDM4OTcgClEgMzA2NiA0MDY5IDI3NDcgNDE1MyAKUSAyNDI4IDQyMzggMjEzMSA0MjM4IApRIDE2MTYgNDIzOCAxMzM2IDQwMzggClEgMTA1NiAzODM4IDEwNTYgMzQ2OSAKUSAxMDU2IDMxNTkgMTI0MiAzMDAxIApRIDE0MjggMjg0NCAxOTQ3IDI3NDcgCkwgMjMyOCAyNjY5IApRIDMwMzQgMjUzNCAzMzcwIDIxOTUgClEgMzcwNiAxODU2IDM3MDYgMTI4OCAKUSAzNzA2IDYwOSAzMjUxIDI1OSAKUSAyNzk3IC05MSAxOTE5IC05MSAKUSAxNTg4IC05MSAxMjE0IC0xNiAKUSA4NDEgNTkgNDQxIDIwNiAKTCA0NDEgODU2IApRIDgyNSA2NDEgMTE5NCA1MzEgClEgMTU2MyA0MjIgMTkxOSA0MjIgClEgMjQ1OSA0MjIgMjc1MyA2MzQgClEgMzA0NyA4NDcgMzA0NyAxMjQxIApRIDMwNDcgMTU4NCAyODM2IDE3NzggClEgMjYyNSAxOTcyIDIxNDQgMjA2OSAKTCAxNzU5IDIxNDQgClEgMTA1MyAyMjg0IDczNyAyNTg0IApRIDQyMiAyODg0IDQyMiAzNDE5IApRIDQyMiA0MDM4IDg1OCA0Mzk0IApRIDEyOTQgNDc1MCAyMDU5IDQ3NTAgClEgMjM4OCA0NzUwIDI3MjggNDY5MCAKUSAzMDY5IDQ2MzEgMzQyNSA0NTEzIAp6CiIgdHJhbnNmb3JtPSJzY2FsZSgwLjAxNTYyNSkiLz4KICAgICAgPC9kZWZzPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTUzIi8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNTYiIHg9IjYzLjQ3NjU2MiIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTUyIiB4PSIxMzEuODg0NzY2Ii8+CiAgICAgPC9nPgogICAgPC9nPgogICAgPGcgaWQ9InBhdGNoXzI1Ij4KICAgICA8cGF0aCBkPSJNIDMyNC41MTYyIDEzMS41NDcxODggCkwgMzQ0LjUxNjIgMTMxLjU0NzE4OCAKTCAzNDQuNTE2MiAxMjQuNTQ3MTg4IApMIDMyNC41MTYyIDEyNC41NDcxODggCnoKIiBzdHlsZT0iZmlsbDogIzhjNTY0YiIvPgogICAgPC9nPgogICAgPGcgaWQ9InRleHRfMjAiPgogICAgIDwhLS0gRGVjaXNpb24gVHJlZSAtLT4KICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzNTIuNTE2MiAxMzEuNTQ3MTg4KSBzY2FsZSgwLjEgLTAuMSkiPgogICAgICA8ZGVmcz4KICAgICAgIDxwYXRoIGlkPSJEZWphVnVTYW5zLTQ0IiBkPSJNIDEyNTkgNDE0NyAKTCAxMjU5IDUxOSAKTCAyMDIyIDUxOSAKUSAyOTg4IDUxOSAzNDM2IDk1NiAKUSAzODg0IDEzOTQgMzg4NCAyMzM4IApRIDM4ODQgMzI3NSAzNDM2IDM3MTEgClEgMjk4OCA0MTQ3IDIwMjIgNDE0NyAKTCAxMjU5IDQxNDcgCnoKTSA2MjggNDY2NiAKTCAxOTI1IDQ2NjYgClEgMzI4MSA0NjY2IDM5MTUgNDEwMiAKUSA0NTUwIDM1MzggNDU1MCAyMzM4IApRIDQ1NTAgMTEzMSAzOTEyIDU2NSAKUSAzMjc1IDAgMTkyNSAwIApMIDYyOCAwIApMIDYyOCA0NjY2IAp6CiIgdHJhbnNmb3JtPSJzY2FsZSgwLjAxNTYyNSkiLz4KICAgICAgIDxwYXRoIGlkPSJEZWphVnVTYW5zLTU0IiBkPSJNIC0xOSA0NjY2IApMIDM5MjggNDY2NiAKTCAzOTI4IDQxMzQgCkwgMjI3MiA0MTM0IApMIDIyNzIgMCAKTCAxNjM4IDAgCkwgMTYzOCA0MTM0IApMIC0xOSA0MTM0IApMIC0xOSA0NjY2IAp6CiIgdHJhbnNmb3JtPSJzY2FsZSgwLjAxNTYyNSkiLz4KICAgICAgPC9kZWZzPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTQ0Ii8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNjUiIHg9Ijc3LjAwMTk1MyIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTYzIiB4PSIxMzguNTI1MzkxIi8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNjkiIHg9IjE5My41MDU4NTkiLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy03MyIgeD0iMjIxLjI4OTA2MiIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTY5IiB4PSIyNzMuMzg4NjcyIi8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNmYiIHg9IjMwMS4xNzE4NzUiLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy02ZSIgeD0iMzYyLjM1MzUxNiIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTIwIiB4PSI0MjUuNzMyNDIyIi8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNTQiIHg9IjQ1Ny41MTk1MzEiLz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjRGVqYVZ1U2Fucy03MiIgeD0iNTAzLjg1MzUxNiIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNEZWphVnVTYW5zLTY1IiB4PSI1NDIuNzE2Nzk3Ii8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI0RlamFWdVNhbnMtNjUiIHg9IjYwNC4yNDAyMzQiLz4KICAgICA8L2c+CiAgICA8L2c+CiAgIDwvZz4KICA8L2c+CiA8L2c+CiA8ZGVmcz4KICA8Y2xpcFBhdGggaWQ9InAwOWMzNzU0ZDYyIj4KICAgPHJlY3QgeD0iMzguMjciIHk9IjI2Ljg4IiB3aWR0aD0iMjY0LjA0NCIgaGVpZ2h0PSIyNDQuMTgiLz4KICA8L2NsaXBQYXRoPgogPC9kZWZzPgo8L3N2Zz4K",
    "pdf": "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1+jX8JU9TybRdBUy1Ks1yxgJE0UiPPmOptUT61o00jIS1MYRrGoDvDv9ME4AABNxywJkn0qUs+TEb7H0swZX+v4Bn0dUlgplbmRzdHJlYW0KZW5kb2JqCjE1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9CYXNlRm9udCAvQk1RUURWK0RlamFWdVNhbnMgL0ZpcnN0Q2hhciAwIC9MYXN0Q2hhciAyNTUKL0ZvbnREZXNjcmlwdG9yIDE0IDAgUiAvU3VidHlwZSAvVHlwZTMgL05hbWUgL0JNUVFEVitEZWphVnVTYW5zCi9Gb250QkJveCBbIC0xMDIxIC00NjMgMTc5NCAxMjMzIF0gL0ZvbnRNYXRyaXggWyAwLjAwMSAwIDAgMC4wMDEgMCAwIF0KL0NoYXJQcm9jcyAxNiAwIFIKL0VuY29kaW5nIDw8IC9UeXBlIC9FbmNvZGluZwovRGlmZmVyZW5jZXMgWyAzMiAvc3BhY2UgNDggL3plcm8gL29uZSAvdHdvIC90aHJlZSAvZm91ciAvZml2ZSAvc2l4IC9zZXZlbiA2NSAvQSA2NyAvQwovRCA3MCAvRiA3NiAvTCAvTSA4MiAvUiAvUyAvVCA4NiAvViA5NyAvYSA5OSAvYyAvZCAvZSAvZiAvZyAxMDUgL2kgMTA4IC9sCi9tIC9uIC9vIC9wIDExNCAvciAvcyAvdCAvdSBdCj4+Ci9XaWR0aHMgMTMgMCBSID4+CmVuZG9iagoxNCAwIG9iago8PCAvVHlwZSAvRm9udERlc2NyaXB0b3IgL0ZvbnROYW1lIC9CTVFRRFYrRGVqYVZ1U2FucyAvRmxhZ3MgMzIKL0ZvbnRCQm94IFsgLTEwMjEgLTQ2MyAxNzk0IDEyMzMgXSAvQXNjZW50IDkyOSAvRGVzY2VudCAtMjM2IC9DYXBIZWlnaHQgMAovWEhlaWdodCAwIC9JdGFsaWNBbmdsZSAwIC9TdGVtViAwIC9NYXhXaWR0aCAxMzQyID4+CmVuZG9iagoxMyAwIG9iagpbIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwCjYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgMzE4IDQwMSA0NjAgODM4IDYzNgo5NTAgNzgwIDI3NSAzOTAgMzkwIDUwMCA4MzggMzE4IDM2MSAzMTggMzM3IDYzNiA2MzYgNjM2IDYzNiA2MzYgNjM2IDYzNiA2MzYKNjM2IDYzNiAzMzcgMzM3IDgzOCA4MzggODM4IDUzMSAxMDAwIDY4NCA2ODYgNjk4IDc3MCA2MzIgNTc1IDc3NSA3NTIgMjk1CjI5NSA2NTYgNTU3IDg2MyA3NDggNzg3IDYwMyA3ODcgNjk1IDYzNSA2MTEgNzMyIDY4NCA5ODkgNjg1IDYxMSA2ODUgMzkwIDMzNwozOTAgODM4IDUwMCA1MDAgNjEzIDYzNSA1NTAgNjM1IDYxNSAzNTIgNjM1IDYzNCAyNzggMjc4IDU3OSAyNzggOTc0IDYzNCA2MTIKNjM1IDYzNSA0MTEgNTIxIDM5MiA2MzQgNTkyIDgxOCA1OTIgNTkyIDUyNSA2MzYgMzM3IDYzNiA4MzggNjAwIDYzNiA2MDAgMzE4CjM1MiA1MTggMTAwMCA1MDAgNTAwIDUwMCAxMzQyIDYzNSA0MDAgMTA3MCA2MDAgNjg1IDYwMCA2MDAgMzE4IDMxOCA1MTggNTE4CjU5MCA1MDAgMTAwMCA1MDAgMTAwMCA1MjEgNDAwIDEwMjMgNjAwIDUyNSA2MTEgMzE4IDQwMSA2MzYgNjM2IDYzNiA2MzYgMzM3CjUwMCA1MDAgMTAwMCA0NzEgNjEyIDgzOCAzNjEgMTAwMCA1MDAgNTAwIDgzOCA0MDEgNDAxIDUwMCA2MzYgNjM2IDMxOCA1MDAKNDAxIDQ3MSA2MTIgOTY5IDk2OSA5NjkgNTMxIDY4NCA2ODQgNjg0IDY4NCA2ODQgNjg0IDk3NCA2OTggNjMyIDYzMiA2MzIgNjMyCjI5NSAyOTUgMjk1IDI5NSA3NzUgNzQ4IDc4NyA3ODcgNzg3IDc4NyA3ODcgODM4IDc4NyA3MzIgNzMyIDczMiA3MzIgNjExIDYwNQo2MzAgNjEzIDYxMyA2MTMgNjEzIDYxMyA2MTMgOTgyIDU1MCA2MTUgNjE1IDYxNSA2MTUgMjc4IDI3OCAyNzggMjc4IDYxMiA2MzQKNjEyIDYxMiA2MTIgNjEyIDYxMiA4MzggNjEyIDYzNCA2MzQgNjM0IDYzNCA1OTIgNjM1IDU5MiBdCmVuZG9iagoxNiAwIG9iago8PCAvQSAxNyAwIFIgL0MgMTggMCBSIC9EIDE5IDAgUiAvRiAyMCAwIFIgL0wgMjEgMCBSIC9NIDIyIDAgUiAvUiAyMyAwIFIKL1MgMjQgMCBSIC9UIDI1IDAgUiAvViAyNiAwIFIgL2EgMjcgMCBSIC9jIDI4IDAgUiAvZCAyOSAwIFIgL2UgMzAgMCBSCi9mIDMxIDAgUiAvZml2ZSAzMiAwIFIgL2ZvdXIgMzMgMCBSIC9nIDM0IDAgUiAvaSAzNSAwIFIgL2wgMzYgMCBSIC9tIDM3IDAgUgovbiAzOCAwIFIgL28gMzkgMCBSIC9vbmUgNDAgMCBSIC9wIDQxIDAgUiAvciA0MiAwIFIgL3MgNDMgMCBSIC9zZXZlbiA0NCAwIFIKL3NpeCA0NSAwIFIgL3NwYWNlIDQ2IDAgUiAvdCA0NyAwIFIgL3RocmVlIDQ4IDAgUiAvdHdvIDQ5IDAgUiAvdSA1MCAwIFIKL3plcm8gNTEgMCBSID4+CmVuZG9iagozIDAgb2JqCjw8IC9GMSAxNSAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0ExIDw8IC9UeXBlIC9FeHRHU3RhdGUgL0NBIDAgL2NhIDEgPj4KL0EyIDw8IC9UeXBlIC9FeHRHU3RhdGUgL0NBIDEgL2NhIDEgPj4KL0EzIDw8IC9UeXBlIC9FeHRHU3RhdGUgL0NBIDAuOCAvY2EgMC44ID4+ID4+CmVuZG9iago1IDAgb2JqCjw8ID4+CmVuZG9iago2IDAgb2JqCjw8ID4+CmVuZG9iago3IDAgb2JqCjw8ID4+CmVuZG9iagoyIDAgb2JqCjw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDExIDAgUiBdIC9Db3VudCAxID4+CmVuZG9iago1MiAwIG9iago8PCAvQ3JlYXRvciAoTWF0cGxvdGxpYiB2My42LjMsIGh0dHBzOi8vbWF0cGxvdGxpYi5vcmcpCi9Qcm9kdWNlciAoTWF0cGxvdGxpYiBwZGYgYmFja2VuZCB2My42LjMpCi9DcmVhdGlvbkRhdGUgKEQ6MjAyNDEwMDIwOTI0MDkrMDYnMDAnKSA+PgplbmRvYmoKeHJlZgowIDUzCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNiAwMDAwMCBuIAowMDAwMDEzMjY1IDAwMDAwIG4gCjAwMDAwMTMwMjggMDAwMDAgbiAKMDAwMDAxMzA2MCAwMDAwMCBuIAowMDAwMDEzMjAyIDAwMDAwIG4gCjAwMDAwMTMyMjMgMDAwMDAgbiAKMDAwMDAxMzI0NCAwMDAwMCBuIAowMDAwMDAwMDY1IDAwMDAwIG4gCjAwMDAwMDAzMzQgMDAwMDAgbiAKMDAwMDAwMTk2MyAwMDAwMCBuIAowMDAwMDAwMjA4IDAwMDAwIG4gCjAwMDAwMDE5NDIgMDAwMDAgbiAKMDAwMDAxMTU3NiAwMDAwMCBuIAowMDAwMDExMzY5IDAwMDAwIG4gCjAwMDAwMTA4ODggMDAwMDAgbiAKMDAwMDAxMjYyOSAwMDAwMCBuIAowMDAwMDAxOTgzIDAwMDAwIG4gCjAwMDAwMDIxNDYgMDAwMDAgbiAKMDAwMDAwMjQ1NCAwMDAwMCBuIAowMDAwMDAyNjkxIDAwMDAwIG4gCjAwMDAwMDI4MzkgMDAwMDAgbiAKMDAwMDAwMjk3MiAwMDAwMCBuIAowMDAwMDAzMTM0IDAwMDAwIG4gCjAwMDAwMDM0MzkgMDAwMDAgbiAKMDAwMDAwMzg1MyAwMDAwMCBuIAowMDAwMDAzOTkxIDAwMDAwIG4gCjAwMDAwMDQxMzUgMDAwMDAgbiAKMDAwMDAwNDUxNSAwMDAwMCBuIAowMDAwMDA0ODIwIDAwMDAwIG4gCjAwMDAwMDUxMjQgMDAwMDAgbiAKMDAwMDAwNTQ0NiAwMDAwMCBuIAowMDAwMDA1NjU1IDAwMDAwIG4gCjAwMDAwMDU5NzcgMDAwMDAgbiAKMDAwMDAwNjE0MyAwMDAwMCBuIAowMDAwMDA2NTU3IDAwMDAwIG4gCjAwMDAwMDY3MDEgMDAwMDAgbiAKMDAwMDAwNjgyMCAwMDAwMCBuIAowMDAwMDA3MTUxIDAwMDAwIG4gCjAwMDAwMDczODcgMDAwMDAgbiAKMDAwMDAwNzY3OCAwMDAwMCBuIAowMDAwMDA3ODMzIDAwMDAwIG4gCjAwMDAwMDgxNDUgMDAwMDAgbiAKMDAwMDAwODM3OCAwMDAwMCBuIAowMDAwMDA4Nzg1IDAwMDAwIG4gCjAwMDAwMDg5MjcgMDAwMDAgbiAKMDAwMDAwOTMyMCAwMDAwMCBuIAowMDAwMDA5NDEwIDAwMDAwIG4gCjAwMDAwMDk2MTYgMDAwMDAgbiAKMDAwMDAxMDAyOSAwMDAwMCBuIAowMDAwMDEwMzUzIDAwMDAwIG4gCjAwMDAwMTA2MDAgMDAwMDAgbiAKMDAwMDAxMzMyNSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDUzIC9Sb290IDEgMCBSIC9JbmZvIDUyIDAgUiA+PgpzdGFydHhyZWYKMTM0ODIKJSVFT0YK"
  }
}
```

**Explanation of Response Fields:**

- **`best_model`**: The regression model that achieved the closest prediction to the specified `target_value`. In this example, "Lasso Regression" was the best-performing model.

- **`best_runtime`**: The time (in seconds) taken to perform the optimization for the best model. Here, the optimization took approximately 6.96 seconds.

- **`best_solution`**: An array of objects representing the optimal solutions found by the PSO algorithm. Each object contains:
  - **`Pred_feature1` & `Pred_feature2`**: The optimized values for each feature that result in a prediction closest to the `target_value`.
  - **`Pred_Epsilon`**: The predicted value based on the optimized features.
  - **`Pred_% Error`**: The relative error between the predicted value and the `target_value`.
  - **`Epsilon`**: The user-specified target value (`4.5` in this case).

**Sample Interpretation:**

- The first solution suggests that setting `feature1` to approximately `2.23` and `feature2` to `4.12` results in a predicted target value (`Pred_Epsilon`) of approximately `4.4999`, which has a very low relative error (`0.002%`) compared to the desired `Epsilon` of `4.5`.

#### **Testing with cURL**

You can also test the `optimize` endpoint using **cURL** with the following command:

```bash
curl -X POST {{baseUrl}}/optimize/ \
     -H "Content-Type: application/json" \
     -d '{
           "data": [
             {"feature1": 1.0, "feature2": 2.0, "target": 3.0},
             {"feature1": 4.0, "feature2": 5.0, "target": 6.0},
             {"feature1": 14.0, "feature2": 15.0, "target": 16.0}
           ],
           "features": ["feature1", "feature2"],
           "target": "target",
           "target_value": 4.5,
           "pso_config": {
             "lb": [0, 0],
             "ub": [10, 10],
             "swarmsize": 50,
             "omega": 0.5,
             "phip": 1.5,
             "phig": 1.5,
             "maxiter": 10,
             "n_solutions": 10,
             "nprocessors": 4,
             "max_rounds": 10,
             "debug_flag": false
           }
         }'
```

### Decoding Base64 Images (Client-Side Example in JavaScript):

```typescript
const pngImage = response.graphs.png;
const img = new Image();
img.src = `data:image/png;base64,${pngImage}`;
document.body.appendChild(img);
```

**Note:** Replace `{{baseUrl}}` with your actual API base URL.

#### **Testing with Postman**

1. **Open Postman** and create a new **POST** request.
2. **Set the URL** to `{{baseUrl}}/optimize/`.
3. **Under the "Headers" tab**, ensure that `Content-Type` is set to `application/json`.
4. **Under the "Body" tab**, select **raw** and **JSON** format.
5. **Paste the Request Payload** provided above into the body.
6. **Send the Request** and observe the response in the **Response** section.

---


By following the above instructions, you can effectively test the `optimize` endpoint and interpret the results to identify the best-performing regression model and its optimal solutions based on your specified target value.

