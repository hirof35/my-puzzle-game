
# TypeScript ピタッとパズル

TypeScript + React + Canvas で作成した、ピースを正しい位置にドラッグしてはめるパズルゲームです。
<img width="1914" height="959" alt="スクリーンショット 2026-05-02 180826" src="https://github.com/user-attachments/assets/383b76a9-23f9-43ab-91ae-25fc52865777" />
## 特徴
- **スナップ機能**: ピースが正解の位置に近づくと「ピタッ」と吸い付きます。
- **シャッフル演出**: 開始時にピースが中央からランダムに弾け飛びます。
- **難易度選択**: 3段階（EASY, NORMAL, HARD）の難易度設定。
- **カスタム画像**: 自分の好きな画像をアップロードしてパズルにできます。

## 使い方
1. `npm install` で依存関係をインストール
2. `npm run dev` でローカルサーバーを起動
3. ブラウザで画像を選択し、「Start Game」をクリック！

## 技術スタック
- React
- TypeScript
- HTML5 Canvas API
- Vite
3. GitHubへのアップロード（コマンド例）
GitHubで新しいリポジトリ（Repository）を作成した後、CMDで以下のコマンドを順番に打ちます。

DOS
# Gitの初期化
git init

# 全ファイルをステージング（追加）
git add .

# コミット（記録）
git commit -m "Initial commit: ピタッとパズル完成版"

# リポジトリの紐付け（GitHub上のURLに書き換えてください）
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git

# メインブランチ名の設定
git branch -M main

# アップロード
git push -u origin main
4. GitHub Pages でゲームを公開する（おまけ）
GitHubには、アップロードしたソースコードをそのまま「ウェブサイト」として公開できる GitHub Pages という機能があります。

npm run build を実行して dist フォルダを作る。

Viteの vite.config.ts に base: './' を追加する。

gh-pages パッケージなどを使ってデプロイする。
