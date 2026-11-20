# Multilingual Episodic Prototypical Contrastive Network (MEPC)

This repository contains notebooks and prepared datasets for multilingual emotion classification with transformer models.
The main experiment implements a **Multilingual Episodic Prototypical Contrastive Network (MEPC)** for six-way emotion classification across English, Malay, and Chinese.

## Emotion labels

All normalized datasets use the same six labels:

`anger`, `disgust`, `joy`, `neutral`, `sadness`, `surprise`

## Repository contents

### Notebooks

- [`mepc.ipynb`](./mepc.ipynb) - Main cross-lingual MEPC experiment. It combines
  GoEmotions, its Malay translation (GoMS), MYBully, and CMED using episodic
  training, prototypes, focal loss, and supervised contrastive learning.
- [`mepc-hungry.ipynb`](./mepc-hungry.ipynb) - A MEPC variant that uses the
  available datasets with a different Malay sampling policy.
- [`mybully.ipynb`](./mybully.ipynb) - Conventional XLM-R sequence
  classification on MYBully using focal loss.

### Data

The [`datasets/`](./datasets/) directory contains normalized, locally usable
copies of the corpora:

| Directory | Language | Purpose |
| --- | --- | --- |
| [`goemotions/`](./datasets/goemotions/) | English | GoEmotions train, validation, and test data |
| [`goms/`](./datasets/goms/) | Malay | Malay translation of GoEmotions |
| [`mybully/`](./datasets/mybully/) | Malay | Normalized MYBully train and validation data |
| [`cmed/`](./datasets/cmed/) | Chinese | Normalized Chinese emotion data |
| [`_raw/`](./datasets/_raw/) | Chinese/Malay | Original source-format datasets |

Most normalized files include `sample_id`, `text`, `label`, `language`, and
source-label metadata. [`emotion_counts.csv`](./datasets/emotion_counts.csv)
contains per-dataset and per-split summary counts. Rows excluded during
normalization are documented in
[`datasets/mybully/excluded_rows.csv`](./datasets/mybully/excluded_rows.csv).

## Setup

Python 3.9 or newer is recommended. Create an environment and install the
packages used by the notebooks:

```bash
python -m venv .venv
```

On Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

On macOS/Linux:

```bash
source .venv/bin/activate
```

Install the notebook dependencies:

```bash
pip install torch transformers scikit-learn pandas matplotlib seaborn jupyter
```

The first model cell downloads `xlm-roberta-base` from the Hugging Face Hub.
The prepared datasets themselves are read from this repository.

## Running the notebooks

From the repository root:

```bash
jupyter notebook
```

Open a notebook and run its cells from top to bottom. The MEPC notebooks
automatically create these output locations:

- `models/` - best model checkpoints
- `outputs/<run-name>/` - metrics, predictions, reports, and training history
- `figures/<run-name>/` - plots and confusion matrices

Training is configured for reproducibility with seed `42`, but GPU results can
still vary across hardware and library versions. A CUDA-capable GPU is strongly
recommended for MEPC training; the notebooks fall back to CPU when CUDA is not
available.

## Data provenance

The repository includes source metadata and label mappings for the datasets.
See the dataset cards in [`datasets/_raw/`](./datasets/_raw/) and the mapping
files in each normalized dataset directory for source revisions, label
conversion rules, and licensing information:

- [Chinese Multi-Emotion Dialogue Dataset](https://huggingface.co/datasets/Johnson8187/Chinese_Multi-Emotion_Dialogue_Dataset)
- [MYBully](https://huggingface.co/datasets/mohanrj/MYBully)
- [GoEmotions](https://github.com/google-research/google-research/tree/master/goemotions)

Please check the original dataset terms before redistributing the data or
derived artifacts.

## Outputs and reproducibility

The MEPC notebook saves a checkpoint and evaluation artifacts including
training history, final metrics, classification reports, test predictions, and
figures. The final evaluation reports accuracy, balanced accuracy, macro-F1,
weighted-F1, and per-class results over fixed support draws.
