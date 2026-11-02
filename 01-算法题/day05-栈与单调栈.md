# Day 5 · 栈 / 单调栈（5 题）

> 今日考点：**栈的"后进先出"匹配**（括号、嵌套）、**辅助栈记录状态**（最小栈）、**单调栈求"下一个更大/更小"**（这是面试里最容易考到却最容易写错的一类）。
> 每题结构：完整题干 → 示例 → 约束 → 提示阶梯 ×3 → 完整 C++ → 复杂度 → 易错点 → 追问。

| 题号 | 题目 | 难度 | 模板一句话 | 复杂度 |
|---|---|---|---|---|
| 20 | 有效的括号 | Easy | 左括号入栈，右括号弹栈比对 | O(n) / O(n) |
| 155 | 最小栈 | Medium | 辅助栈同步记录"到目前的最小值" | O(1) 全操作 |
| 394 | 字符串解码 | Medium | 栈存(外层串, 重复次数) | O(输出长度) |
| 739 | 每日温度 | Medium | 单调递减栈存下标 | O(n) |
| 84 | 柱状图中最大的矩形 | Hard | 单调递增栈 + 左右哨兵 | O(n) |

:::card 两个模板先背下来
**单调栈（求"下一个更大"）**——栈里存**下标**，从底到顶单调递减：
```cpp
for (int i = 0; i < n; i++) {
    while (!st.empty() && a[i] > a[st.top()]) {   // 当前元素比栈顶大 → 栈顶的答案确定
        res[st.top()] = i - st.top();             // 结算
        st.pop();
    }
    st.push(i);
}
```
**为什么是 O(n)**：每个下标最多入栈一次、出栈一次。
**哨兵技巧**：首尾各加一个极小/极大值，可以省掉循环结束后"清空栈"的收尾逻辑（84 题会用到）。
:::

---

:::qa LC 20 · 有效的括号（Easy｜必刷）

**题目**
给定一个只包括 `'('`、`')'`、`'{'`、`'}'`、`'['`、`']'` 的字符串 `s`，判断字符串是否有效。
有效字符串需满足：
1. 左括号必须用**相同类型**的右括号闭合；
2. 左括号必须以**正确的顺序**闭合；
3. 每个右括号都有一个对应的相同类型的左括号。

**示例 1**
```
输入：s = "()"
输出：true
```

**示例 2**
```
输入：s = "()[]{}"
输出：true
```

**示例 3**
```
输入：s = "(]"
输出：false
```

**示例 4**
```
输入：s = "([])"
输出：true
```

**约束**：`1 <= s.length <= 10^4`；`s` 仅由括号 `'()[]{}'` 组成

**提示 1（方向）**
括号匹配天然是"最后出现的左括号最先被闭合" → **后进先出 → 栈**。

**提示 2（关键不变量）**
栈内始终是"**尚未匹配的左括号**"，且自底向上就是它们在原串中的出现顺序。所以：
- 遇到右括号时栈必须非空（否则是多余的右括号）；
- 遍历结束时栈必须为空（否则有未闭合的左括号）。

**提示 3（伪代码）**
```
for c in s:
    if c 是左括号: push(c)
    else:
        if st 空: return false
        if 栈顶与 c 不匹配: return false
        pop
return st 为空
```

**完整代码**

```cpp
// LC 20 有效的括号
// 栈：左括号入栈，右括号与栈顶比对
#include <string>
#include <stack>
using namespace std;

bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) return false;                 // 多余的右括号，如 "()]"
            char t = st.top();
            st.pop();
            if ((c == ')' && t != '(') ||
                (c == ']' && t != '[') ||
                (c == '}' && t != '{')) return false;     // 类型不匹配，如 "(]"
        }
    }
    return st.empty();                                     // 未闭合的左括号，如 "(("
}
```

**复杂度**：时间 O(n)，空间 O(n)。

**易错点**
- 漏判 `st.empty()` → `"()]"` 时 `st.top()` 崩溃。
- 最后 `return true` 而不是 `return st.empty()` → `"(("` 误判为 true。
- 用"右括号映射左括号"的 map 更整洁，但要记得 `count` 判断。

**面试追问**
- 只有一种括号？→ 用一个计数器即可，O(1) 空间。
- 允许 `*` 通配（LC 678）？→ 双栈（左括号位置栈 + 星号位置栈）或贪心区间法。
- 递归/DFS 写法为什么不如栈好？→ 递归深度受限于字符串长度，栈是显式的更安全。
:::

:::qa LC 155 · 最小栈（Medium｜必刷）

**题目**
设计一个支持 `push`、`pop`、`top` 操作，并能在**常数时间**内检索到最小元素的栈。
实现 `MinStack` 类：
- `MinStack()`：初始化堆栈对象
- `void push(int val)`：将元素 `val` 推入堆栈
- `void pop()`：删除堆栈顶部的元素
- `int top()`：获取堆栈顶部的元素
- `int getMin()`：获取堆栈中的最小元素

**示例 1**
```
输入：
["MinStack","push","push","push","getMin","pop","top","getMin"]
[[],[-2],[0],[-3],[],[],[],[]]
输出：[null,null,null,null,-3,null,0,-2]

解释：
MinStack ms = new MinStack();
ms.push(-2);
ms.push(0);
ms.push(-3);
ms.getMin();   // -3
ms.pop();      // 弹出 -3
ms.top();      // 0
ms.getMin();   // -2   ← 注意最小值要"恢复"到 -2
```

**约束**：`-2^31 <= val <= 2^31 - 1`；`pop` / `top` / `getMin` 总是在非空栈上调用；最多调用 `3 * 10^4` 次

**提示 1（方向）**
只用主栈的话，`pop` 掉最小值之后无法知道"上一个最小值"是多少 → 需要一个能**随主栈同步回退**的结构 → **辅助栈**。

**提示 2（关键不变量）**
辅助栈第 `i` 个元素 = 主栈前 `i` 个元素的最小值。两个栈**长度永远相同**，所以 `push`/`pop` 都是同步的（不需要额外条件判断）。

**提示 3（伪代码）**
```
push(v): st.push(v); mn.push(min(v, mn 空 ? v : mn.top()))
pop():   st.pop();  mn.pop()
getMin():mn.top()
```

**完整代码**

```cpp
// LC 155 最小栈
// 辅助栈与主栈等长：mn.top() 就是当前栈中最小值
#include <stack>
#include <algorithm>
using namespace std;

class MinStack {
    stack<int> st, mn;
public:
    MinStack() {}

    void push(int val) {
        st.push(val);
        mn.push(mn.empty() ? val : min(val, mn.top()));   // 同步记录当前最小值
    }

    void pop() {
        st.pop();
        mn.pop();                                          // 同步弹出
    }

    int top() { return st.top(); }
    int getMin() { return mn.top(); }
};
```

**复杂度**：所有操作 O(1)；空间 O(n)。

**易错点**
- 只在 `val < mn.top()` 时压辅助栈 → 两栈长度不一致，`pop` 时错位。
- 用单个变量记最小值 → `pop` 掉最小值后无法恢复。
- `push` 时忘了处理空栈（`mn.empty()`）。

**面试追问**
- 只用一个栈怎么做？→ 栈里存 `pair<val, curMin>`，或用"存差值"（`val - min`，需 `long long` 防溢出）。
- 如果要求 O(1) 且常数级额外空间？→ 差值法可以，但溢出风险需要说明。
- 多线程场景？→ 加锁，或用 thread_local。
:::

:::qa LC 394 · 字符串解码（Medium｜必刷）

**题目**
给定一个经过编码的字符串，返回它解码后的字符串。
编码规则为 `k[encoded_string]`，表示方括号内部的 `encoded_string` 正好重复 `k` 次。`k` 保证为正整数。
- 输入字符串总是有效的；没有额外的空格，方括号总是符合格式要求。
- 原始数据不包含数字，所有数字只表示重复次数 `k`（不会出现 `3a` 或 `2[4]` 这类输入）。

**示例 1**
```
输入：s = "3[a]2[bc]"
输出："aaabcbc"
```

**示例 2**
```
输入：s = "3[a2[c]]"
输出："accaccacc"
解释：内层 2[c] → "cc"；3[acc] → "accaccacc"
```

**示例 3**
```
输入：s = "2[abc]3[cd]ef"
输出："abcabccdcdcdef"
```

**示例 4**
```
输入：s = "abc3[cd]xyz"
输出："abccdcdcdxyz"
```

**约束**：`1 <= s.length <= 30`；`s` 由小写英文字母、数字和方括号组成；所有整数取值范围 `[1, 300]`

**提示 1（方向）**
括号是**嵌套**的（`3[a2[c]]`）→ 每进入一层就要"保存外层状态"，退出时恢复 → **栈**。
栈里要存两样东西：**外层已经拼好的字符串** + **这一层的重复次数**。

**提示 2（关键不变量）**
遍历中维护 `cur`（当前层已解码的串）和 `k`（当前的数字）。
`'['` 表示"开始新层"：把 `(cur, k)` 压栈并清空 `cur`、`k`。
`']'` 表示"结束当前层"：弹栈，把 `cur` 重复 `k` 次后拼到外层串后面。

**提示 3（伪代码）**
```
st = []
cur = "", k = 0
for c in s:
    if 数字:  k = k*10 + (c-'0')
    elif '[': st.push({cur,k}); cur=""; k=0
    elif ']': (outer, times) = st.pop(); cur = outer + repeat(cur, times)
    else:     cur += c
return cur
```

**完整代码**

```cpp
// LC 394 字符串解码
// 栈存 (外层已解码串, 重复次数)，遇到 ']' 弹栈拼接
#include <string>
#include <stack>
#include <cctype>
using namespace std;

string decodeString(string s) {
    stack<pair<string, int>> st;      // (外层串, 重复次数)
    string cur;
    int k = 0;

    for (char c : s) {
        if (isdigit(c)) {
            k = k * 10 + (c - '0');   // 处理多位数，如 "10[ab]"
        } else if (c == '[') {
            st.push({cur, k});        // 保存外层状态
            cur.clear();
            k = 0;
        } else if (c == ']') {
            pair<string, int> top = st.top();
            st.pop();
            string rep;
            for (int i = 0; i < top.second; i++) rep += cur;
            cur = top.first + rep;    // 拼回外层
        } else {
            cur += c;
        }
    }
    return cur;
}
```

**复杂度**：时间 O(输出长度)（拼接导致的额外开销与结果长度同阶），空间 O(栈深度 + 当前串)。

**易错点**
- 多位数没处理（只按单字符累加 `k`）→ `10[ab]` 错。
- `'['` 时忘记把 `k` 清零 → 后续数字累加错。
- 拼接顺序写反（`cur = rep + outer`）→ 前缀丢失。
- 用 C++17 结构化绑定 `auto [outer, times] = st.top();` 前要确认编译标准。

**面试追问**
- 递归写法？→ 用引用传参的 `dfs(i)` 返回解码后的串并推进下标。
- 时间复杂度是 O(n) 还是 O(n²)？→ 取决于字符串拼接实现（每次 `+=` 是摊还 O(1)，但重复段拼接仍是 O(输出长度)）。
- 如果括号不匹配怎么办？→ 题目保证有效；工程实现要加校验和最大长度限制（防爆炸）。
:::

:::qa LC 739 · 每日温度（Medium｜必刷）

**题目**
给定一个整数数组 `temperatures`，表示每天的温度，返回一个数组 `answer`，其中 `answer[i]` 是指对于第 `i` 天，**下一个更高温度**出现在几天后。
如果气温在这之后都不会升高，请在该位置用 `0` 来代替。

**示例 1**
```
输入：temperatures = [73,74,75,71,69,72,76,73]
输出：[1,1,4,2,1,1,0,0]
```

**示例 2**
```
输入：temperatures = [30,40,50,60]
输出：[1,1,1,0]
```

**示例 3**
```
输入：temperatures = [30,60,90]
输出：[1,1,0]
```

**约束**：`1 <= temperatures.length <= 10^5`；`30 <= temperatures[i] <= 100`

**提示 1（方向）**
求"右边第一个比我大的元素" → 典型的**单调栈**。写暴力是 O(n²)，单调栈 O(n)。

**提示 2（关键不变量）**
栈里存**下标**，且从底到顶对应的温度**单调递减**（因为一旦来了更大的就把小的都弹掉）。
当前温度 `T[i]` 大于栈顶温度时，栈顶下标的答案就是 `i - 栈顶下标`。

**提示 3（伪代码）**
```
for i in 0..n-1:
    while st 非空 and T[i] > T[st.top()]:
        res[st.top()] = i - st.top(); st.pop()
    st.push(i)
```

**完整代码**

```cpp
// LC 739 每日温度
// 单调递减栈（存下标）：遇到更高温度即结算
#include <vector>
#include <stack>
using namespace std;

vector<int> dailyTemperatures(vector<int>& T) {
    int n = T.size();
    vector<int> res(n, 0);          // 默认 0（后面没有更高温度）
    stack<int> st;                  // 存下标，温度单调递减

    for (int i = 0; i < n; i++) {
        while (!st.empty() && T[i] > T[st.top()]) {
            res[st.top()] = i - st.top();   // 天数差
            st.pop();
        }
        st.push(i);
    }
    return res;
}
```

**复杂度**：时间 O(n)（每个下标进出栈各一次），空间 O(n)。

**易错点**
- 用 `>=` 代替 `>`：相等不算"更高"，会把答案算小/算错。
- 栈里存**值**而不是下标 → 无法算天数差。
- 结算后忘记 `pop`。

**面试追问**
- 求"下一个**更大或相等**的"？→ 把 `>` 改成 `>=`。
- 求"**上一个**更大的"？→ 从右往左扫，或反向维护。
- 循环数组版本的"下一个更大元素"（LC 503）？→ 遍历 `2n` 次，下标取模。
:::

:::qa LC 84 · 柱状图中最大的矩形（Hard｜必刷）

**题目**
给定 `n` 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 `1`。
求在该柱状图中，能够勾勒出来的**矩形的最大面积**。

**示例 1**
```
输入：heights = [2,1,5,6,2,3]
输出：10
解释：最大的矩形是高度 5 和 6 组成、高为 5、宽为 2 的矩形（面积 10）
```

**示例 2**
```
输入：heights = [2,4]
输出：4
```

**约束**：`1 <= heights.length <= 10^5`；`0 <= heights[i] <= 10^4`

**提示 1（方向）**
枚举"以某根柱子为最矮柱"的矩形：它的高度就是 `heights[i]`，宽度是**左右两侧第一个比它矮的柱子之间的距离**。求"左右第一个更小" → **单调递增栈**。

**提示 2（关键不变量）**
栈内存下标、高度**单调递增**。当 `heights[i] < heights[st.top()]` 时，栈顶元素的右边界就是 `i`，左边界是**弹出后新的栈顶**，宽度 = `i - 新栈顶 - 1`。
**哨兵技巧**：在首尾各加一个高度 `0`，这样所有柱子最后都会被弹出结算，省掉循环后的清栈代码。

**提示 3（伪代码）**
```
heights = [0] + heights + [0]; st = []
for i in 0..n-1:
    while st 非空 and heights[i] < heights[st.top()]:
        h = heights[st.pop()]
        w = i - st.top() - 1        // 左边界是新的栈顶
        best = max(best, h*w)
    st.push(i)
```

**完整代码**

```cpp
// LC 84 柱状图中最大的矩形
// 单调递增栈 + 首尾哨兵：每个柱子出栈时结算"以它为最矮柱"的最大矩形
#include <vector>
#include <stack>
#include <algorithm>
using namespace std;

int largestRectangleArea(vector<int>& h) {
    h.insert(h.begin(), 0);     // 左哨兵：保证栈不会空，宽度公式统一
    h.push_back(0);             // 右哨兵：保证最后所有柱子都被弹出结算

    stack<int> st;              // 下标，高度单调递增
    int best = 0;
    int n = h.size();

    for (int i = 0; i < n; i++) {
        while (!st.empty() && h[i] < h[st.top()]) {
            int height = h[st.top()];
            st.pop();
            int width = i - st.top() - 1;    // 左边界 = 弹出后的栈顶
            best = max(best, height * width);
        }
        st.push(i);
    }
    return best;
}
```

**复杂度**：时间 O(n)，空间 O(n)。

**易错点**
- 宽度公式写成 `i - 弹出的下标` → 少了左侧可行宽度。
- 没有哨兵时忘记循环结束后清栈 → 漏掉"一直递增到最后"的矩形。
- `h.insert(h.begin(), 0)` 修改了入参（面试时可以说明，或改用 `vector<int> a = h` 拷贝）。

**面试追问**
- 与 LC 42 接雨水的单调栈对比：42 弹栈时算的是"横向水槽"（`min(左,右) - h[mid]` × 宽度），84 算的是"以弹出柱为高"的矩形。
- 如果要**返回矩形的位置**？→ 结算时记录 `left/right/height`。
- 如果柱子可以不相邻拼接？→ 变成"最大矩形内柱子和"（另一类题）。
:::

---

## 今日复盘三问

1. 单调栈解决的是哪一类问题？（**"每个元素左右第一个更大/更小"**，以及在它上面派生的面积/跨度问题）
2. 为什么单调栈是 O(n)？栈里存**下标**还是存值，为什么？
3. 84 题的哨兵解决了什么麻烦？（省掉收尾清栈 + 避免栈空时访问 `st.top()`）
