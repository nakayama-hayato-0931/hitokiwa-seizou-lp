# 建築業向け外国人人材紹介LP

このプロジェクトは、建築業界向けの外国人人材紹介サービスのランディングページです。
WordPress環境への埋め込みを想定し、外部ライブラリ（jQueryなど）に依存せず、標準的なHTML/CSS/JavaScriptで構築されています。

## ディレクトリ構成

```
/lp-construction
  ├── index.html       # メインページ
  ├── /css
  │   └── style.css    # スタイルシート
  ├── /js
  │   └── main.js      # インタラクション用スクリプト
  └── /images          # 画像素材
      ├── /hero        # ヒーローセクション用
      ├── /icons       # アイコン
      └── /placeholder # プレースホルダー
```

## WordPressへの導入手順

1. **ファイルのアップロード**:
   - `/css`, `/js`, `/images` フォルダをテーマディレクトリ（例: `/wp-content/themes/your-theme/`）内の適切な場所にアップロードします。
   - または、LP専用の固定ページ用テンプレートを作成し、そのディレクトリに配置することも可能です。

2. **HTMLの組み込み**:
   - `index.html` の `<body>` タグ内のコンテンツを、WordPressの固定ページエディタ（カスタムHTMLブロックなど）またはページテンプレートファイル（`page-lp.php`など）にコピーします。

3. **パスの修正**:
   - CSS、JS、画像の読み込みパスをWordPress環境に合わせて修正してください。
   - 例: `src="images/..."` → `src="<?php echo get_template_directory_uri(); ?>/images/..."`

## カスタマイズ

- **配色**: `css/style.css` の `:root` 変数で定義されているカラーコードを変更することで、サイト全体の配色を調整できます。
- **フォーム**: お問い合わせフォームの送信先は `index.html` の `<form>` タグの `action` 属性で設定してください。

## ブラウザ対応
- Google Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Microsoft Edge (Latest)
