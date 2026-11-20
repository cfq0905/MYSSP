---
language:
- ms
size_categories:
- 1K<n<10K
pretty_name: Cyberbully Dataset for Bahasa Malaysia
---
# Dataset Card for MYBully

MYBully is a manually and HITL-annotated dataset of social media posts in Bahasa Malaysia (with some code-mixed English), designed for multiple text classification tasks including cyberbullying detection, hate speech detection, sentiment analysis, and emotion recognition.

## Uses

- Training and evaluation of classification models for cyberbullying detection.
- Benchmarking multitask NLP models for low-resource languages (Malay).
- Cross-task learning (transfer from sentiment/emotion to bullying-related tasks).

## Dataset Structure
1. Instances: 4,680 tweets
- 2,687 manually annotated
- 1,993 annotated via Human-in-the-Loop (HITL) strategy

2. Tasks:
- Cyberbullying (binary/multi-label)
- Hate Speech (binary)
- Sentiment (positive/neutral/negative)
- Emotion (e.g., anger, joy, sadness, fear, neutral)

3. Each instance includes:
- Tweet
- Sentiment: *Positive, Negative or Neutral*
- Emotion: *Anger, Disgust, Neutral, Sadness, Fear, Surprise, Happiness*
- Bully: *Yes, No*
- Hate: *Yes, No*
- anno_type (To indicate, if record is Manually Annotated or HITL-Based Annotation): *manual, hitl*
*More details will be shared soon*

```bibtex
@misc{mohan_raj_2026,
  author       = {Mohan Raj and Manjeevan Singh Seera },
  title        = {MYBully},
  year         = 2026,
  url          = {https://huggingface.co/datasets/mohanrj/MYBully },
  doi          = {10.57967/hf/8021 },
  publisher    = {Hugging Face },
  howpublished = {\url{https://huggingface.co/datasets/mohanrj/MYBully}}
}
```