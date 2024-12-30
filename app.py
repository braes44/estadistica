# app.py
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import io
import base64
import scipy.stats as stats
from statsmodels.stats.anova import AnovaRM
from statsmodels.formula.api import ols
import statsmodels.api as sm

app = Flask(__name__)

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json  # Load JSON data from request
    df = pd.DataFrame(data['data'])

    # Perform calculations
    result = {}

    # Measures of central tendency
    result['mean'] = df.mean().to_dict()
    result['median'] = df.median().to_dict()
    result['mode'] = df.mode().iloc[0].to_dict()

    # Kurtosis and skewness
    result['kurtosis'] = df.kurtosis().to_dict()
    result['skewness'] = df.skew().to_dict()

    # Normality test (Shapiro-Wilk)
    normality = {col: stats.shapiro(df[col].dropna()).pvalue for col in df.columns}
    result['normality'] = normality

    # Control charts (X-bar and R chart)
    xbar = df.mean(axis=1)
    r = df.max(axis=1) - df.min(axis=1)
    xbar_limits = {
        'UCL': xbar.mean() + 3 * xbar.std(),
        'LCL': xbar.mean() - 3 * xbar.std()
    }
    r_limits = {
        'UCL': r.mean() + 3 * r.std(),
        'LCL': max(0, r.mean() - 3 * r.std())
    }
    result['control_chart'] = {'xbar': xbar_limits, 'r': r_limits}

    # IMR Charts
    imr_values = {'Individual': df.mean(axis=1).tolist(), 'Moving Range': np.abs(df.diff(axis=1)).mean(axis=1).tolist()}
    result['imr_chart'] = imr_values

    # ANOVA (One-way)
    if 'anova_factor' in data:
        factor = data['anova_factor']
        df['factor'] = factor
        model = ols('value ~ C(factor)', data=df.melt(id_vars=['factor'])).fit()
        anova_table = sm.stats.anova_lm(model, typ=2)
        result['anova'] = anova_table.to_dict()

    # Equality of Variances Test (Levene's Test)
    if len(df.columns) > 1:
        levene_test = stats.levene(*[df[col].dropna() for col in df.columns])
        result['levene_test'] = {'statistic': levene_test.statistic, 'pvalue': levene_test.pvalue}

    # Generate plots
    plots = {}

    # Histogram
    plt.figure()
    df.hist()
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plots['histogram'] = base64.b64encode(img.getvalue()).decode()
    plt.close()

    # Boxplot
    plt.figure()
    df.boxplot()
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plots['boxplot'] = base64.b64encode(img.getvalue()).decode()
    plt.close()

    # Individual Value Chart
    plt.figure()
    for col in df.columns:
        plt.plot(df[col], label=col)
    plt.legend()
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plots['individual_values'] = base64.b64encode(img.getvalue()).decode()
    plt.close()

    # IMR Chart
    plt.figure()
    plt.subplot(211)
    plt.plot(imr_values['Individual'], marker='o', linestyle='-', label='Individual Values')
    plt.axhline(y=np.mean(imr_values['Individual']), color='red', linestyle='--', label='Mean')
    plt.legend()
    plt.subplot(212)
    plt.plot(imr_values['Moving Range'], marker='o', linestyle='-', label='Moving Range')
    plt.axhline(y=np.mean(imr_values['Moving Range']), color='red', linestyle='--', label='Mean')
    plt.legend()
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plots['imr_chart'] = base64.b64encode(img.getvalue()).decode()
    plt.close()

    result['plots'] = plots

    return jsonify(result)

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    try:
        # Load Excel file into a DataFrame
        df = pd.read_excel(file)
        # Placeholder response: Add more processing as needed
        response = {
            "description": "File uploaded and processed successfully.",
            "preview": df.head().to_dict()
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
