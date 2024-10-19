# In api/views.py
import pandas as pd
import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor
from pyswarm import pso
import time
from datetime import datetime
import threading
import warnings

# Added imports for plotting and image handling
import matplotlib.pyplot as plt
from io import BytesIO
import base64
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend


class PSO_Optimizer:
    def __init__(self, regressor, scaler, objective):
        self.regressor = regressor
        self.scaler = scaler
        self.objective = lambda x, cp: objective(x, cp, regressor)

    def optimisation(self, n_run, optimisation_options, manager_list):
        print('Optimization No.:', n_run)
        np.random.seed(n_run)

        xopt, fopt = pso(
            self.objective,
            optimisation_options['lb'],
            optimisation_options['ub'],
            args=[optimisation_options['Epsilon']],
            swarmsize=optimisation_options['swarmsize'],
            omega=optimisation_options['omega'],
            phip=optimisation_options['phip'],
            phig=optimisation_options['phig'],
            maxiter=optimisation_options['maxiter'],
            debug=optimisation_options['debug_flag'])
        manager_list.append((xopt, fopt))
        return (xopt, fopt)

    def optimisation_parallel(self, optimisation_options):
        n_solutions = optimisation_options['n_solutions']
        nprocessors = optimisation_options['nprocessors']
        start = time.time()
        starttime = datetime.now()

        print('Optimisation sequence started at time: ' + starttime.strftime("%Y-%m-%d %H:%M:%S"))

        run_flag = True
        round_count = 0

        sols_per = []
        sols_xopts = []
        sols_pred = []

        while run_flag:
            seeds_list = np.arange(1, nprocessors + 1) + nprocessors * round_count

            round_count += 1
            print('Working on round:', round_count)

            return_list = []

            processes = []
            for i in seeds_list:
                p = threading.Thread(name=str(i), target=self.optimisation, args=(i, optimisation_options, return_list))
                processes.append(p)
                p.start()

            for j in processes:
                j.join()

            for xopt, fopt in return_list:
                # Convert xopt to DataFrame with feature names to avoid scaler warnings
                x_df = pd.DataFrame([xopt], columns=optimisation_options['opt_vars'])
                x_scaled = self.scaler.transform(x_df)
                pred_xopt = self.regressor.predict(x_scaled)[0]
                if optimisation_options['Epsilon'] != 0:
                    per_sol_pred = abs(pred_xopt - optimisation_options['Epsilon']) / optimisation_options['Epsilon']
                else:
                    per_sol_pred = 999999999999999999999999

                sols_per.append(per_sol_pred)
                sols_xopts.append(xopt)
                sols_pred.append(pred_xopt)

            print('So far', len(sols_per), 'solutions have been found')
            if len(sols_per) >= n_solutions:
                run_flag = False

                sols_per = np.array(sols_per)
                sols_xopts = np.array(sols_xopts)
                sols_pred = np.array(sols_pred)

                sols_per_argsort = np.array(sols_per).argsort()

                sols_per = sols_per[sols_per_argsort]
                sols_xopts = sols_xopts[sols_per_argsort]
                sols_pred = sols_pred[sols_per_argsort]

                sols_per = sols_per[:n_solutions]
                sols_xopts = sols_xopts[:n_solutions]
                sols_pred = sols_pred[:n_solutions]

            if round_count > optimisation_options['max_rounds']:
                run_flag = False

        sols_df = pd.DataFrame()

        for _item in enumerate(optimisation_options['opt_vars']):
            sols_df[optimisation_options['opt_vars'][_item[0]]] = sols_xopts[:, _item[0]]

        sols_df['Epsilon'] = sols_pred
        sols_df['% Error'] = sols_per

        end = time.time()
        runtime = end - start

        print('Optimisation finished in %.3f' % (runtime), '[s]')

        sols_df.columns = ['Pred_' + item for item in sols_df.columns]

        sols_df.loc[:, 'Epsilon'] = optimisation_options['Epsilon']

        return sols_df, runtime


def get_model(model_name):
    """
    Initialize and return a regression model with predefined optimal parameters.
    """
    if model_name == "Random Forest":
        # Predefined optimal parameters
        return RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42)
    elif model_name == "Linear Regression":
        return LinearRegression()
    elif model_name == "Ridge Regression":
        return Ridge(alpha=1.0, random_state=42)
    elif model_name == "Lasso Regression":
        return Lasso(alpha=0.1, random_state=42)
    elif model_name == "SVR":
        return SVR(C=1.0, kernel="rbf")
    elif model_name == "Decision Tree":
        return DecisionTreeRegressor(max_depth=10, random_state=42)
    else:
        raise ValueError(f"Unknown model: {model_name}")


@api_view(['POST'])
def optimize(request):
    try:
        # Extract data from request
        data = pd.DataFrame(request.data['data'])
        features = request.data['features']
        target = request.data['target']
        pso_config = request.data['pso_config']
        target_value = request.data['target_value']  # New field

        # Validate target_value
        if target_value is None:
            return Response({"error": "Missing 'target_value' in request data."}, status=400)
        if not isinstance(target_value, (int, float)):
            return Response({"error": "'target_value' must be a numeric value."}, status=400)

        X = data[features]
        y = data[target]

        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Scaling
        scaler = MinMaxScaler()
        scaler.fit(X_train)  # Fit scaler on X_train
        # X_train_scaled is not used further since models are fitted directly on X_train_scaled
        # X_train_scaled = scaler.transform(X_train)

        # Define all supported models
        supported_models = [
            "Random Forest",
            "Linear Regression",
            "Ridge Regression",
            "Lasso Regression",
            "SVR",
            "Decision Tree"
        ]

        # Objective function
        def objective(x, epsilon, regressor):
            # Convert x to DataFrame with feature names to avoid scaler warnings
            x_df = pd.DataFrame([x], columns=features)
            x_scaled = scaler.transform(x_df)
            prediction = regressor.predict(x_scaled)[0]
            return abs(prediction - epsilon)

        epsilon = target_value  # Use user-provided target_value

        optimisation_options = {
            'lb': pso_config['lb'],
            'ub': pso_config['ub'],
            'Epsilon': epsilon,
            'swarmsize': pso_config['swarmsize'],
            'omega': pso_config['omega'],
            'phip': pso_config['phip'],
            'phig': pso_config['phig'],
            'maxiter': pso_config['maxiter'],
            'debug_flag': pso_config.get('debug_flag', False),
            'n_solutions': pso_config['n_solutions'],
            'nprocessors': pso_config['nprocessors'],
            'max_rounds': pso_config['max_rounds'],
            'opt_vars': features
        }

        results = []
        best_fopt = float('inf')
        best_model_name = None
        best_sols_df = None
        best_runtime = None

        # Dictionary to store best solutions per model
        best_solutions_per_model = {}

        for model_name in supported_models:
            print(f"Starting optimization for model: {model_name}")
            regressor = get_model(model_name)
            regressor.fit(scaler.transform(X_train), y_train)  # Fit model on scaled data

            optimizer = PSO_Optimizer(regressor, scaler, objective)
            sols_df, runtime = optimizer.optimisation_parallel(optimisation_options)

            # Find the best fopt for this model
            current_best_fopt = sols_df['Pred_% Error'].min()
            print(f"Model: {model_name}, Best % Error: {current_best_fopt}")

            # Get the best solution (first row after sorting)
            best_solution = sols_df.iloc[sols_df['Pred_% Error'].idxmin()]
            # Extract feature values
            feature_values = best_solution.filter(regex='Pred_').drop(['Pred_Epsilon', 'Pred_% Error']).to_dict()
            # Remove 'Pred_' prefix from feature names
            feature_values = {k.replace('Pred_', ''): v for k, v in feature_values.items()}

            best_solutions_per_model[model_name] = feature_values

            results.append({
                'model_name': model_name,
                'best_fopt': current_best_fopt,
                'runtime': runtime
            })

            # Update the best model if current is better
            if current_best_fopt < best_fopt:
                best_fopt = current_best_fopt
                best_model_name = model_name
                best_sols_df = sols_df
                best_runtime = runtime

        if not best_solutions_per_model:
            return Response({"error": "No models were optimized."}, status=400)

        # Create comparison table: rows are features, columns are models
        comparison_table = pd.DataFrame(best_solutions_per_model).T  # Models as rows
        comparison_table = comparison_table[features]  # Ensure correct feature order
        comparison_table = comparison_table.transpose()  # Features as rows, models as columns

        # Convert comparison table to dictionary
        comparison_table_dict = comparison_table.to_dict(orient='index')

        # Generate graphs
        # Example: Bar chart comparing feature values across models

        plt.figure(figsize=(10, 6))
        comparison_table.plot(kind='bar')
        plt.title('Feature Values Comparison Across Models')
        plt.xlabel('Features')
        plt.ylabel('Feature Values')
        plt.legend(title='Models', bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.tight_layout()

        # Function to encode plot to base64 in a given format
        def encode_plot(format='png'):
            buf = BytesIO()
            plt.savefig(buf, format=format)
            buf.seek(0)
            encoded = base64.b64encode(buf.read()).decode('utf-8')
            buf.close()
            return encoded

        # Encode plots in desired formats
        raster_formats = ['png', 'jpg']
        vector_formats = ['svg', 'pdf']
        images = {}

        for fmt in raster_formats + vector_formats:
            images[fmt] = encode_plot(format=fmt)

        plt.close()

        # Optionally, include more plots as needed

        # Prepare the response with all required fields
        response_data = {
            'best_model': best_model_name,
            'best_runtime': best_runtime,
            'best_fopt': best_fopt,
            'best_solution': best_sols_df.to_dict(orient='records'),
            'comparison_table': comparison_table_dict,
            'graphs': images  # Contains base64 encoded images in multiple formats
        }

        return Response(response_data)

    except KeyError as e:
        return Response({"error": f"Missing key in request data: {str(e)}"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
