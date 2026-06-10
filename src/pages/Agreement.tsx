import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'

const SERVICE_AGREEMENT = {
  title: '音瓶用户服务协议',
  updated: '2026年6月10日',
  sections: [
    {
      heading: '一、总则',
      content: `1.1 本协议是您与音瓶（以下简称"本平台"）之间关于使用本平台服务所订立的协议。请您仔细阅读本协议，在确认充分理解并同意后再开始使用。\n\n1.2 您一旦使用本平台服务，即视为您已阅读并同意本协议的约束。本平台有权在必要时修改本协议内容，修改后的协议一经公布即有效替代原协议。\n\n1.3 本平台提供的服务包括但不限于：音乐搜索、在线播放、歌单管理、个性化推荐、会员增值服务等。`
    },
    {
      heading: '二、账号注册与使用',
      content: `2.1 您在注册账号时应提供真实、准确、完整的个人资料，并保持资料的及时更新。因注册信息不真实而引起的问题由您自行承担。\n\n2.2 您应妥善保管账号和密码，因您保管不当造成的损失由您自行承担。如发现账号被非法使用，应立即通知本平台。\n\n2.3 您不得将账号转让、出售或出借给他人使用。由此产生的一切责任由您承担。\n\n2.4 游客模式下可使用部分基础功能，注册登录后可享受完整服务。`
    },
    {
      heading: '三、用户行为规范',
      content: `3.1 您在使用本平台服务时，必须遵守中华人民共和国相关法律法规的规定。\n\n3.2 您不得利用本平台服务从事以下活动：\n（1）反对宪法所确定的基本原则的；\n（2）危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；\n（3）损害国家荣誉和利益的；\n（4）煽动民族仇恨、民族歧视，破坏民族团结的；\n（5）侵犯他人知识产权等合法权益的；\n（6）发布垃圾信息、广告信息的；\n（7）利用技术手段批量获取平台内容的。`
    },
    {
      heading: '四、知识产权',
      content: `4.1 本平台所有内容（包括但不限于文字、图片、音频、视频、软件、程序及网页设计）的知识产权均属于本平台或相关权利人所有。\n\n4.2 未经本平台或相关权利人书面许可，您不得以任何形式复制、传播、展示、修改、出版或授权他人使用本平台内容。\n\n4.3 本平台音乐作品的相关权利归原始权利人所有，本平台通过合法授权提供音乐播放服务。`
    },
    {
      heading: '五、免责声明',
      content: `5.1 本平台对服务不作任何类型的担保，包括但不限于服务的及时性、安全性、准确性。\n\n5.2 因不可抗力导致的服务中断，本平台不承担责任。\n\n5.3 您理解并同意，在使用本平台服务时可能存在来自任何他人的包括威胁性的、诽谤性的、令人反感的或非法的内容或行为，本平台不承担任何责任。`
    },
    {
      heading: '六、协议终止',
      content: `6.1 您有权随时终止使用本平台服务，并注销您的账号。\n\n6.2 如您违反本协议规定，本平台有权终止向您提供服务。\n\n6.3 协议终止后，本平台没有义务为您保留账号中的任何信息。`
    }
  ]
}

const PRIVACY_POLICY = {
  title: '音瓶隐私政策',
  updated: '2026年6月10日',
  sections: [
    {
      heading: '一、我们收集的信息',
      content: `1.1 您注册账号时提供的信息：手机号码、密码。\n\n1.2 您使用服务时产生的信息：搜索记录、播放历史、收藏内容、歌单数据、设备信息（设备型号、操作系统版本）、日志信息（IP地址、访问时间、操作记录）。\n\n1.3 我们不会收集您的通讯录、短信、相册等敏感权限信息。`
    },
    {
      heading: '二、信息的使用',
      content: `2.1 我们收集的信息将用于：\n（1）提供、维护和改善我们的服务；\n（2）个性化推荐和内容分发；\n（3）安全防护和风险控制；\n（4）服务优化和数据分析。\n\n2.2 未经您的同意，我们不会将您的个人信息提供给第三方，但以下情况除外：\n（1）法律法规要求；\n（2）应政府主管部门的合法要求；\n（3）为维护社会公众的利益；\n（4）为维护本平台的合法权益。`
    },
    {
      heading: '三、信息的存储',
      content: `3.1 您的个人信息存储在中华人民共和国境内的服务器上。\n\n3.2 我们仅在本政策所述目的所必需的期间内保留您的个人信息。\n\n3.3 当超出必要保留期限后，我们将对您的个人信息进行删除或匿名化处理。`
    },
    {
      heading: '四、信息安全',
      content: `4.1 我们采用业界领先的技术手段来保护您的个人信息安全，包括但不限于数据加密、访问控制、安全审计等。\n\n4.2 我们制定了严格的信息安全管理制度，对员工接触个人信息进行严格限制。\n\n4.3 尽管我们采取了合理的安全措施，但互联网环境并非绝对安全，我们建议您妥善保管账号密码。`
    },
    {
      heading: '五、您的权利',
      content: `5.1 您有权访问您的个人信息，可在"个人中心"查看和修改。\n\n5.2 您有权删除您的个人信息，可在"设置"中操作。\n\n5.3 您有权撤回授权同意，关闭相关功能即可。\n\n5.4 您有权注销您的账号，注销后我们将删除您的个人信息。\n\n5.5 如您行使上述权利，可通过本平台"设置-意见反馈"与我们联系。`
    },
    {
      heading: '六、未成年人保护',
      content: `6.1 我们非常重视对未成年人个人信息的保护。\n\n6.2 若您是18岁以下的未成年人，在使用本平台服务前，应在您的父母或其他监护人监护、指导下共同阅读并同意本隐私政策。\n\n6.3 我们不会主动收集未成年人的个人信息，如发现在未事先获得监护人同意的情况下收集了未成年人的个人信息，将设法尽快删除相关数据。`
    },
    {
      heading: '七、隐私政策的更新',
      content: `7.1 本隐私政策可能适时修订。\n\n7.2 未经您明确同意，我们不会削减您按照本隐私政策所应享有的权利。\n\n7.3 对于重大变更，我们会通过弹窗、公告等方式通知您。\n\n7.4 本政策所指的重大变更包括但不限于：个人信息使用目的发生变化、个人信息共享对象发生变化、您参与个人信息处理的权利发生变化等。`
    }
  ]
}

export default function Agreement() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const type = searchParams.get('type') || 'service'
  const data = type === 'privacy' ? PRIVACY_POLICY : SERVICE_AGREEMENT

  return (
    <div className={clsx('min-h-screen', darkMode ? 'bg-[#0f0f1a]' : 'bg-gradient-to-b from-[#f4f8f2] via-[#faf6f0] to-[#f0ede6]')}>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className={clsx(
              'flex items-center gap-1 text-sm transition-colors',
              darkMode ? 'text-zinc-400 hover:text-emerald-400' : 'text-emerald-600 hover:text-emerald-700'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
        </div>

        {/* 标题区 */}
        <div className="mb-6">
          <h1 className={clsx('text-xl font-bold mb-1', darkMode ? 'text-white' : 'text-emerald-800')}>
            {data.title}
          </h1>
          <p className={clsx('text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-400/70')}>
            更新日期：{data.updated}
          </p>
        </div>

        {/* 内容区 */}
        <div className="glass-card p-5 space-y-6">
          {data.sections.map((section, i) => (
            <div key={i}>
              <h2 className={clsx('text-base font-semibold mb-2', darkMode ? 'text-emerald-400' : 'text-emerald-700')}>
                {section.heading}
              </h2>
              <div className={clsx('text-sm leading-relaxed whitespace-pre-line', darkMode ? 'text-zinc-300' : 'text-emerald-800/80')}>
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className={clsx('text-center mt-6 text-xs', darkMode ? 'text-zinc-600' : 'text-emerald-400/50')}>
          如有疑问，请通过"设置-意见反馈"联系我们
        </div>
      </div>
    </div>
  )
}
