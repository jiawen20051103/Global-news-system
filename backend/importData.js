import fs from 'fs';
import path from 'path';
import sequelize from './src/config/db.js';
import User from './src/models/User.js';
import Role from './src/models/Role.js';
import Right from './src/models/Right.js';
import News from './src/models/News.js';
import Category from './src/models/Category.js';
import Region from './src/models/Region.js';
import Child from './src/models/Child.js';

// 读取 db.json 文件
const dbPath = path.join(process.cwd(), '../db.json');
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 导入数据的函数
const importData = async () => {
  try {
    console.log('开始导入数据...');

    // 先同步数据库模型，创建表结构
    console.log('同步数据库模型...');
    await sequelize.sync({ force: true });
    console.log('数据库模型同步完成');

    // 1. 导入权限数据
    console.log('导入权限数据...');
    for (const right of dbData.rights) {
      await Right.create(right);
    }

    // 2. 导入子权限数据
    console.log('导入子权限数据...');
    for (const child of dbData.children) {
      await Child.create(child);
    }

    // 2. 导入角色数据
    console.log('导入角色数据...');
    for (const role of dbData.roles) {
      await Role.create(role);
    }

    // 3. 导入分类数据
    console.log('导入分类数据...');
    for (const category of dbData.categories) {
      await Category.create(category);
    }

    // 4. 导入地区数据
    console.log('导入地区数据...');
    for (const region of dbData.regions) {
      await Region.create(region);
    }

    // 5. 导入用户数据
    console.log('导入用户数据...');
    for (const user of dbData.users) {
      await User.create(user);
    }

    // 6. 导入新闻数据
    console.log('导入新闻数据...');
    for (const news of dbData.news) {
      await News.create(news);
    }

    console.log('数据导入完成！');
  } catch (error) {
    console.error('数据导入失败:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
};

// 执行导入
importData();