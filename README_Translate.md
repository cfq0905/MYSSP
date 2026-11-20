# Cross-Lingual Emotion Dataset Translation with Qwen

Ancross-lingual translation pipeline that uses `Qwen2.5-3B-Instruct` to translate English emotion datasets into Bahasa Melayu.

---

## HOW TO SWITCH BETWEEN EAT AND TOGA

Before initiating translation, you can configure the prompting method by setting the `TRANSLATION_MODE` variable in **Cell 2**:

```python
# Set to "EAT" for Emotion-Aware Translation, or "TOGA" for unconditioned translation
TRANSLATION_MODE = "EAT"
