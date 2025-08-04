<template>
  <div id="app">
    <el-container style="min-height: 100vh; background-color: #f0f0f0; padding: 1rem;">
  <el-card class="header-card" shadow="always">
    <el-row justify="space-between" align="middle">
      <el-col :span="12">
        <h1 style="color: #409EFF; margin: 0">将你的日志上传到mclo.gs，分享给别人！</h1>
      </el-col>
      <el-col :span="12" style="text-align: right">
        <el-button type="primary" link @click="openBlog">
          返回博客主页
        </el-button>
      </el-col>
    </el-row>
  </el-card>
      <el-main>
        <h1 class="text-center"></h1>
        <el-card class="container" shadow="always">
          <el-steps :active="activeStep" align-center>
            <el-step title="选择上传方式" :icon="Edit" />
            <el-step title="上传日志" />
            <el-step title="获取链接" />
          </el-steps>
          <div v-if="activeStep === 0" class="step-content">
            <el-radio-group v-model="uploadMethod" size="large">
              <el-radio-button label="paste" border>粘贴日志</el-radio-button>
              <el-radio-button label="file" border>上传文件</el-radio-button>
            </el-radio-group>
            
            <div class="button-group">
              <el-button type="primary" @click="nextStep" :disabled="!uploadMethod">下一步</el-button>
            </div>
          </div>
          <div v-else-if="activeStep === 1" class="step-content">
            <div v-if="uploadMethod === 'paste'">
              <el-input
                type="textarea"
                :rows="10"
                placeholder="请将日志粘贴在此处！"
                v-model="logContent">
              </el-input>
            </div>
            <div v-else-if="uploadMethod === 'file'">
              <el-upload
                action="#"
                :auto-upload="false"
                :on-change="handleFileChange"
                accept=".txt,.log">
                <el-button type="primary" >点击上传文件</el-button>
              </el-upload>
            </div>
            <div class="button-group">
              <el-button type="primary" @click="uploadLogOrFile" v-loading.fullscreen.lock="fullscreenLoading">上传</el-button>
              <el-button type="default" @click="prevStep">上一步</el-button>
            </div>
          </div>
          <div v-else class="step-content">
            <el-result
              icon="success"
              title="成功上传"
              :sub-title="`链接为：${responseOutput}，您可通过复制链接按钮进行复制，分享给他人。`"
            >
              <template #extra>
                <el-button type="primary" @click="ResetStep">重新上传</el-button>
                <el-button type="secondary" @click="copyToClipboard">{{ copyButtonText }}</el-button>
              </template>
            </el-result>
          </div>
        </el-card>
      </el-main>
      <el-footer style="display: flex; justify-content: center; align-items: center;">
        <el-card style="width: 100%; max-width: 800px; text-align: center;">
          <p>简幻欢非官方交流群：963075840  </p>
          <p>服务器交流群：664085606 </p>
        </el-card>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { ref } from 'vue';
import { ElMessage,ElLoading } from 'element-plus';

export default {
  

  setup() {
    const fullscreenLoading = ref(false);
    const activeStep = ref(0);
    const uploadMethod = ref('');
    const logContent = ref('');
    const fileContent = ref('');
    const responseOutput = ref('');
    const copyButtonText = ref('复制链接');
    const openBlog = () => {
  window.open('https://ideafox.top')
};
    
    const nextStep = () => {
      if (!uploadMethod.value) {
        ElMessage.error('请选择一种上传方式！');
        return;
      }
      activeStep.value++;
    };

    const prevStep = () => {
      activeStep.value--;
    };
    const ResetStep = ()=>{
      activeStep.value = 0;
      uploadMethod.value = '';
      logContent.value = '';
      fileContent.value = '';
      responseOutput.value = '';
    };

    const handleFileChange = (file, fileList) => {
      const allowedExtensions = ['txt', 'log'];
  const fileName = file.raw.name;
  const extension = fileName.split('.').pop().toLowerCase();
  
  if (!allowedExtensions.includes(extension)) {
    ElMessage.error('仅支持上传.txt和.log类型的文件');
    return; // 阻止后续文件读取
  }
      const reader = new FileReader();
      reader.onload = e => fileContent.value = e.target.result;
      reader.readAsText(file.raw);
    };

    const uploadLogOrFile = async () => {
      fullscreenLoading.value = true
      if ((uploadMethod.value === 'paste' && !logContent.value.trim()) || 
          (uploadMethod.value === 'file' && !fileContent.value)) {
        ElMessage.error(uploadMethod.value === 'paste' ? '请先粘贴或输入日志内容！' : '请选择一个文件进行上传！');
        fullscreenLoading.value = false;
        return;
      }

      const formData = new FormData();
      let content = uploadMethod.value === 'paste' ? logContent.value : fileContent.value;

      formData.append('content', content);

      try {
        const res = await fetch('https://api.mclo.gs/1/log', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if(data.success) {
          responseOutput.value = data.url;
          activeStep.value++;
        } else {
          ElMessage.error(`上传失败：${data.error}`);
        }
      } catch(error) {
        ElMessage.error('请求过程中出现错误，请稍后再试。');
      } finally {
        fullscreenLoading.value = false;
      }
    };

    const copyToClipboard = () => {
      if (!responseOutput.value) {
        ElMessage.error('没有可复制的链接！');
        return;
      }

      navigator.clipboard.writeText(responseOutput.value).then(() => {
        ElMessage.success('链接已复制到剪贴板！');
      }).catch(err => {
        ElMessage.error('无法复制链接，请手动复制。');
      });
    };

    return {
      activeStep,
      uploadMethod,
      logContent,
      responseOutput,
      copyButtonText,
      nextStep,
      prevStep,
      handleFileChange,
      uploadLogOrFile,
      copyToClipboard,
      ResetStep,
      fullscreenLoading,
      openBlog,
    };
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.text-center {
  text-align: center;
}

.el-steps {
  margin: 20px 0;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.step-content {
  text-align: center;
}
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}
</style>
