## 项目介绍

巡线卫士web端项目代码



## 参与项目

###### 1. 下载代码

``` javascript
git clone http://192.168.102.9/xxws/xxws-web.git
cd xxws-web
```

###### 2. 切换到当前开发版本对应的分支

``` java
git checkout v1.6  //用v1.6这个分支举例，随开发版本的改变而变动
```
###### 3. 创建自己开发的分支，基于当前开发版本

``` java
git checkout -b v1.6-shifei //自己名字的拼音全拼
```
###### 4. 开发项目，在自己的分支上进行

``` java
npm install //安装项目相关的依赖包
npm run start //启动项目，会自动打开浏览器，可配合nginx开发
npm run build //打包项目代码到dist文件，用于发布
```

###### 5. 提交代码

``` java
git add .  //将工作区代码提交到暂存区
git commit -m "修改描述"  //将暂存区代码生成一个版本
git push origin v1.6-shifei  //推送自己分支到远程仓库
// 登录gitlab，申请合并自己的分支到当前的开发分支上
```


###### 6. 更新自己分支的代码

``` java
git pull origin v1.6  //更新开发分支上的代码
git checkout v1.6-shifei  //切换到自己分支
git merge v1.6  //合并v1.6的代码到自己的分支上
```
