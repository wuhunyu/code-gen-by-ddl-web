<template>
  <div>
    <el-form
      ref="form"
      :inline="true"
      :model="form"
      :rules="rules"
      @submit.native.prevent>
      <el-row :gutter="24">
        <el-col :span="8">
          <el-form-item label="模板" prop="templateName">
            <el-select
              v-model="form.templateName"
              filterable
              clearable
              placeholder="请选择模板">
              <el-option
                v-for="template in templates"
                :key="template"
                :label="template"
                :value="template"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="openConfigurations">其他配置</el-button>
          <el-button type="primary" @click="codeGen">生成</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="24">
          <el-input
            class="sql-textarea"
            type="textarea"
            :placeholder="defaultDDLStr"
            v-model="form.ddlSql"
          />
        </el-col>
      </el-row>
    </el-form>

    <el-drawer
      :title="drawerTitle"
      :visible.sync="drawerVisible"
      direction="rtl">
      <el-form
        :inline="true"
        label-width="110px"
        @submit.native.prevent>
        <div
          v-for="configurationsConfig in configurationsConfigs"
          :key="configurationsConfig.prop">
          <el-form-item
            :label="configurationsConfig.desc"
            :prop="configurationsConfig.prop">
            <el-input
              class="drawer-input"
              clearable
              @clear="drawerInputClear(configurationsConfig.prop)"
              v-model="configurations[configurationsConfig.prop]"
              @blur="configurationChange(configurationsConfig.prop)"
              maxLength="30"
              :placeholder="'请输入' + configurationsConfig.desc"/>
          </el-form-item>
        </div>
      </el-form>
    </el-drawer>

    <el-dialog
      :title="dialogTitle"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      top="5vh"
      width="90%"
      append-to-body>
      <el-tabs
        v-model="activeTab">
        <el-tab-pane
          v-for="templateName in templateNames"
          :key="templateName"
          :label="templateName"
          :name="templateName">
          <el-input
            class="template-textarea"
            type="textarea"
            :placeholder="templateName"
            v-model="codeGenRes[templateName]"
          />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
import {codeGen, listTemplateNames} from '@/api/codeGen'
import cookie from "js-cookie";

export default {
  name: "CodeGen",
  data() {
    return {
      templates: [],
      form: {
        templateName: '',
        ddlSql: ''
      },
      configurations: {
        packageName: '',
        moduleName: '',
        author: '',
        tablePrefix: ''
      },
      // 默认 ddl sql
      defaultDDLStr:
        `create table t_user
(
    id              bigint primary key comment '主键',
    user_name       varchar(120) not null comment '用户名称',
    phone           char(11)     not null comment '电话号码',
    birthday        datetime     null comment '出生日期',

    available       tinyint      not null default 0 comment '启用/禁用状态(0: 启用; 1: 禁用)',
    del_flag        tinyint      not null default 0 comment '逻辑删除标识位(0: 正常; 1: 已删除)',

    create_by       bigint       not null comment '创建人id',
    create_datetime datetime     not null comment '创建日期时间',
    update_by       bigint       null comment '修改人id',
    update_datetime datetime     null comment '修改日期时间'
) comment '用户';`,
      configurationsConfigs: [
        {
          prop: 'packageName',
          desc: '包名'
        },
        {
          prop: 'moduleName',
          desc: '模块名'
        },
        {
          prop: 'author',
          desc: '作者'
        },
        {
          prop: 'tablePrefix',
          desc: '表前缀'
        },
        {
          prop: 'createDatetime',
          desc: '创建日期时间'
        }
      ],
      templateNames: [
        'entity',
        'mapper',
        'mapperXml',
        'service',
        'serviceImpl',
        'controller'
      ],
      codeGenRes: {},
      rules: {
        templateName: [{
          required: true,
          message: '请选择模板',
          trigger: 'change'
        }]
      },

      drawerTitle: '其他配置',
      drawerVisible: false,

      dialogTitle: '生成结果',
      dialogVisible: false,

      activeTab: 'entity'
    }
  },
  created() {
    // 获取可使用的模板名称列表
    this.listTemplateNames();
    // 填充 cookie 中保留的值
    this.collectCookie();
  },
  methods: {
    // 收集 cookie
    collectCookie() {
      let keys = Object.keys(this.configurations);
      for (let key of keys) {
        let val = cookie.get(key);
        this.configurations[key] = val ? val : ''
      }
    },
    // 获取可使用的模板名称列表
    listTemplateNames() {
      listTemplateNames().then(res => {
        this.templates = res.data
        if (this.templates && this.templates.length === 1) {
          this.form.templateName = this.templates[0]
        }
      }).catch(err => {
        this.$notify.error({
          title: '错误',
          message: err
        });
      });
    },
    // 代码生成
    codeGen() {
      // 构造请求
      this.$refs['form'].validate((valid) => {
        if (valid) {
          // 请求生成
          let requestBody = {
            ddlSql: this.form.ddlSql ? this.form.ddlSql : this.defaultDDLStr,
            templateName: this.form.templateName,
            packageName: this.configurations['packageName'],
            moduleName: this.configurations['moduleName'],
            author: this.configurations['author'],
            tablePrefix: this.configurations['tablePrefix'],
            createDatetime: this.configurations['createDatetime']
          }
          codeGen(requestBody).then(res => {
            this.codeGenRes = res.data
            this.dialogVisible = true
          }).catch(err => {
            this.$notify.error({
              title: '错误',
              message: err
            });
          });
        }
      });
    },
    // 打开其他配置页面
    openConfigurations() {
      this.drawerVisible = true
    },
    // 其他配置属性修改事件
    configurationChange(configurationsConfig) {
      // 设置 cookie
      if (this.configurations[configurationsConfig]) {
        cookie.set(configurationsConfig,
          this.configurations[configurationsConfig], {expires: 7});
      }
    },
    // 移除 cookie
    drawerInputClear(configurationsConfig) {
      cookie.remove(configurationsConfig)
    }
  }
}
</script>

<style>
.sql-textarea .el-textarea__inner {
  height: 85vh;
}

.template-textarea .el-textarea__inner {
  height: 70vh;
}

.drawer-input {
  width: 300px;
}
</style>
