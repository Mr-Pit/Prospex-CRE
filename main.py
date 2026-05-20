import matplotlib.pyplot as plt
import numpy as np


def main():
    rng = np.random.default_rng(seed=42)
    x = rng.normal(loc=10, scale=2, size=20)
    y = 2.5 * x + rng.normal(loc=0, scale=3, size=20)

    plt.scatter(x, y, color="royalblue", edgecolor="black")
    plt.title("Synthetic Scatter Plot")
    plt.xlabel("Feature X")
    plt.ylabel("Feature Y")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()
