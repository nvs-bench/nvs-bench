#!/bin/bash

echo "Setting up development environment for nvs-leaderboard..."

# Install development dependencies
echo "Installing development dependencies..."
pip install -r requirements.txt

# Install pre-commit hooks
echo "Installing pre-commit hooks..."
pre-commit install

# Run initial formatting
echo "Running initial code formatting..."
make format

echo ""
echo "Development environment setup complete!"
echo ""
echo "Available commands:"
echo "  make format    - Format code with Black and isort"
echo "  make lint      - Run flake8 linting"
echo "  make check     - Run both formatting and linting"
echo "  make clean     - Remove Python cache files"
echo "  make help      - Show all available commands"
echo ""
echo "Pre-commit hooks are installed and will run automatically on commits."
