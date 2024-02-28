<h1 align="center">PCR 竞技场查询</h1>

[![npm](https://img.shields.io/npm/v/koishi-plugin-pcr-arena?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-pcr-arena)

竞技场查询功能的数据来自 [公主连结Re: Dive Fan Club - 硬核的竞技场数据分析站](https://pcrdfans.com/) ，查询需要授权 key。

## 配置项

### API_KEY
- 类型: `string`

[公主连结Re: Dive Fan Club](https://www.pcrdfans.com/bot) 的授权 key。如果没有 key，**不建议**您因本项目而去联系 [公主连结Re: Dive Fan Club](https://www.pcrdfans.com) 的作者，推荐您点击此[链接](https://www.pcrdfans.com/battle)前往网站进行查询。

## 使用

发送 `怎么拆 + 接防守队角色名` 查询竞技场解法。如：`怎么拆羊驼黄骑 emt 凛 ue`。

- 此插件已对[前缀](https://koishi.chat/zh-CN/api/core/app.html#options-prefix)进行处理，可以不加前缀就触发。
- 查询到的解法中如果有首次出现的角色，将会下载对应角色的头像资源，下载速度视部署环境而定，可能会较长时间才能完成。