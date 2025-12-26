import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

categories = ['Negative', 'Neutral', 'Positive']
baseline_scores = [85.6, 83.9, 86.5]
focal_loss_scores = [89.1, 87.4, 89.3]

df = pd.DataFrame({
    'Sentiment': categories * 2,
    'Accuracy (%)': baseline_scores + focal_loss_scores,
    'Loss Type': ['Cross Entropy Loss']*3 + ['Focal Loss']*3
})

plt.figure(figsize=(8,5))
sns.set_style("whitegrid")

palette = {'Cross Entropy Loss': '#1f77b4', 'Focal Loss': '#ff7f0e'}

barplot = sns.barplot(data=df, x='Sentiment', y='Accuracy (%)', hue='Loss Type',
                      palette=palette, edgecolor='black', linewidth=1.2)

plt.ylabel('Accuracy (%)', fontsize=14)
plt.xlabel('Sentiment Category', fontsize=14)

for p in barplot.patches:
    height = p.get_height()
    barplot.annotate(f'{height:.1f}%',
                     (p.get_x() + p.get_width() / 2., height),
                     ha='center', va='bottom', fontsize=12)

sns.despine()

# 图例放右下角，稍微往内缩一点，避免挡图
plt.legend(title='Loss Strategy', fontsize=12, title_fontsize=13,
           loc='lower right', bbox_to_anchor=(1, 0), borderaxespad=0.)

plt.tight_layout()
plt.show()
