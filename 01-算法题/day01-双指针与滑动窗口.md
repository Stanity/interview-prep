# Day 1 · 双指针 / 滑动窗口（6 题）

> 今日考点：**对撞双指针**（有序性 → 单调性 → 可以丢弃一侧）、**快慢/滑动窗口**（窗口内统计量 + 何时缩左）。
> 用法：先自己写，卡 10 分钟再看下一级提示；点开卡片才看到代码。手机上可用 `🎯 抽背` 刷这一组。

| 题号 | 题目 | 模板一句话 | 复杂度 |
|---|---|---|---|
| 1 | 两数之和 | 哈希查补数，先查再放 | O(n) / O(n) |
| 15 | 三数之和 | 排序 + 固定一个 + 夹逼 + 三处去重 | O(n²) / O(1) |
| 11 | 盛最多水的容器 | 对撞指针，移动矮的一边 | O(n) / O(1) |
| 3 | 无重复最长子串 | 窗口 + 上次出现位置 | O(n) / O(Σ) |
| 76 | 最小覆盖子串 | 窗口 + valid 计数（种类数） | O(n+m) / O(Σ) |
| 42 | 接雨水 | 左右最大值的较小者决定水位（双指针 O(1) 空间） | O(n) / O(1) |

---

:::qa LC 1 · 两数之和（Easy｜必刷）

**题意**：无序数组，返回两个下标，使和等于 target。保证只有一个答案，同一元素不能用两次。

**提示 1（方向）**
暴力是两层循环 O(n²)。要降到 O(n)，就得把"找另一个数"变成 O(1) 查询 —— 用什么结构能把"值 → 下标"存起来？

**提示 2（关键不变量）**
遍历到 `i` 时，哈希表里存的是 `0..i-1` 的所有值。所以查到 `target - nums[i]` 就一定是**前面**出现过的、且不等于 `i` 的下标。**先查后放**这个顺序就是"同一元素不能用两次"的保证。

**提示 3（伪代码）**
```
mp = {}
for i in 0..n-1:
    need = target - nums[i]
    if need in mp: return [mp[need], i]
    mp[nums[i]] = i
```

**完整代码**

```cpp
// LC 1 两数之和
// 哈希查补数：边扫边查，先查再放，避免自己配自己
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;                 // 值 -> 下标
    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];
        if (mp.count(need)) return {mp[need], i};   // 先查，用的是更早的下标
        mp[nums[i]] = i;                            // 再放，本轮不参与匹配
    }
    return {};
}
```

**复杂度**：时间 O(n)，空间 O(n)。

**易错点**
- 先放后查 → 遇到 `target = 2 * nums[i]` 时会返回 `[i, i]`（错）。
- 用 `mp[need]` 判存在会插入 0 值条目；要么 `count`，要么 `find`。

**面试追问**
- 数组**已排序**怎么办？→ 对撞双指针 O(n)/O(1)，但要求返回**值**而不是下标。
- 要返回**所有**不重复的数对？→ 排序 + 双指针 + 跳过重复。
- 数据流式到达，随时要回答？→ 边插边查的哈希就是在线算法。
:::

:::qa LC 15 · 三数之和（Medium｜必刷）

**题意**：找出所有和为 0 的**不重复**三元组。

**提示 1（方向）**
三层循环 O(n³)。先排序，固定第一个数 `i`，问题就退化成"在 `i+1..n-1` 里找两数之和为 `-nums[i]`" —— 排序后可用对撞双指针 O(n)，整体 O(n²)。

**提示 2（关键不变量）**
有序时，若 `nums[l] + nums[r] < target`，则 `nums[l]` 与**任何** `r' < r` 的组合都更小，所以 `l` 可以安全右移。这就是"丢弃一侧不丢解"的单调性论证。

去重有**三处**：固定位 `i`、左指针 `l`、右指针 `r`。

**提示 3（伪代码）**
```
sort(nums)
for i in 0..n-3:
    if i>0 and nums[i]==nums[i-1]: continue
    if nums[i] > 0: break
    l=i+1, r=n-1
    while l<r:
        s = nums[i]+nums[l]+nums[r]
        if s<0: l++
        elif s>0: r--
        else: 记录; 跳过重复的 l/r; l++, r--
```

**完整代码**

```cpp
// LC 15 三数之和
// 排序 + 固定一个 + 对撞双指针 + 三处去重
#include <vector>
#include <algorithm>
using namespace std;

vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> res;
    int n = nums.size();

    for (int i = 0; i + 2 < n; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;   // 去重①：固定位
        if (nums[i] > 0) break;                          // 后面都 >0，不可能凑 0

        int l = i + 1, r = n - 1;
        while (l < r) {
            int s = nums[i] + nums[l] + nums[r];
            if (s < 0)      l++;
            else if (s > 0) r--;
            else {
                res.push_back({nums[i], nums[l], nums[r]});
                while (l < r && nums[l] == nums[l + 1]) l++;  // 去重②：左
                while (l < r && nums[r] == nums[r - 1]) r--;  // 去重③：右
                l++; r--;
            }
        }
    }
    return res;
}
```

**复杂度**：时间 O(n²)，空间 O(1)（不计结果）。

**易错点**
- 去重只写了一处 → 出现重复三元组。
- `while (l < r && ...)` 里漏了 `l < r` → 越界。
- 忘记 `nums[i] > 0 break`（不是错，但会白白多跑）。

**面试追问**
- 四数之和（LC 18）？→ 再套一层循环 + 同样的去重，O(n³)。
- k 数之和通用写法？→ 递归：`k==2` 时用双指针，否则循环固定一个数。
- 如果要求**最接近** 0 的三元组？（LC 16）→ 双指针过程中维护最小差。
:::

:::qa LC 11 · 盛最多水的容器（Medium｜必刷）

**题意**：两条竖线 + x 轴围成容器，求最大容积 `min(h[l], h[r]) * (r - l)`。

**提示 1（方向）**
面积由"较矮的一边 × 宽度"决定。宽度随指针内移必然减小，所以**只有让较矮的一边变高，面积才可能变大** → 每次移动矮的一侧。

**提示 2（关键不变量）**
设当前 `h[l] <= h[r]`。若保留 `l` 而移动 `r`：宽度变小，且高度上限仍是 `h[l]`，面积不可能超过当前值 → 所以以 `l` 为左边界的所有解**已经枚举完**，可以安全丢弃 `l`。这就是"移动矮边不丢解"的论证。

**提示 3（伪代码）**
```
l=0, r=n-1, best=0
while l<r:
    best = max(best, (r-l)*min(h[l],h[r]))
    if h[l] < h[r]: l++ else r--
```

**完整代码**

```cpp
// LC 11 盛最多水的容器
// 对撞双指针：每次移动较矮的一侧，因为移动高的一侧只会让面积更小
#include <vector>
#include <algorithm>
using namespace std;

int maxArea(vector<int>& height) {
    int l = 0, r = (int)height.size() - 1, best = 0;
    while (l < r) {
        best = max(best, (r - l) * min(height[l], height[r]));
        if (height[l] < height[r]) l++;   // 矮的一侧是瓶颈
        else r--;
    }
    return best;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 与 LC 42 接雨水搞混：**这题是选两条线求最大面积，不求和**。
- 用 `<=` / `<` 都行，但要保证每次都移动一个，别写死循环。

**面试追问**
- 为什么不是"移动高的一侧"？→ 用上面的不变量论证回答，这是本题唯一的证明点。
- 如果数组长度为 2？→ 直接返回 `min*1`，逻辑天然覆盖。
:::

:::qa LC 3 · 无重复字符的最长子串（Medium｜必刷）

**题意**：求不含重复字符的最长**子串**长度（子串必须连续）。

**提示 1（方向）**
连续 + 最长 + 合法性随右边界扩张单调恶化 → **滑动窗口**。窗口内维护"每个字符最后一次出现的下标"。

**提示 2（关键不变量）**
窗口 `[l, r]` 内始终无重复。当 `s[r]` 上次出现在 `last >= l` 时，左边界必须跳到 `last + 1`。注意 **`l` 只能右移**（用 `max(l, last+1)`），不能回退。

**提示 3（伪代码）**
```
last[128] = -1
l=0, best=0
for r in 0..n-1:
    if last[s[r]] >= l: l = last[s[r]] + 1
    last[s[r]] = r
    best = max(best, r-l+1)
```

**完整代码**

```cpp
// LC 3 无重复字符的最长子串
// 滑动窗口 + 字符上次出现位置：左界只能右移
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int lengthOfLongestSubstring(string s) {
    vector<int> last(128, -1);          // ASCII 字符 -> 上次出现的下标
    int l = 0, best = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        if (last[s[r]] >= l) l = last[s[r]] + 1;   // 跳到重复字符之后
        last[s[r]] = r;
        best = max(best, r - l + 1);
    }
    return best;
}
```

**复杂度**：时间 O(n)，空间 O(字符集)。

**易错点**
- 写成 `l = last[s[r]] + 1` 而不判 `>= l` → `l` 可能**左移**，答案偏大。
- 用 `while` 逐个收缩也能过，但多一层循环，容易写错边界。

**面试追问**
- 字符集换成 Unicode？→ `unordered_map<char32_t,int>` 或 `unordered_map<char,int>`。
- 要求返回**子串本身**？→ 额外记录 `bestStart`。
- 最多允许 K 个重复？（LC 340）→ 窗口内用"不同字符计数"控制。
:::

:::qa LC 76 · 最小覆盖子串（Hard｜必刷）

**题意**：在 `s` 中找最短子串，使其包含 `t` 的**所有字符（含重复次数）**。

**提示 1（方向）**
"包含 t 的所有字符"是窗口内可增量维护的可行性条件 → 滑动窗口：右扩直到覆盖，然后尽量缩左，每次缩之前记录最优。

**提示 2（关键不变量）**
用一个 `valid` 记录"**已达标的字符种类数**"，只有在计数正好跨过阈值时才 `±1`（`cnt[c] == need[c]` 或 `cnt[c] == need[c]-1`），这样判断覆盖是 O(1)，不必每次遍历 t。

**提示 3（伪代码）**
```
need = 计数(t); needKind = need.size(); valid=0
l=0; start=0; minLen=INF
for r in 0..n-1:
    cnt[s[r]]++; if 达标: valid++
    while valid == needKind:
        记录最优（在缩左之前）
        cnt[s[l]]--; if 掉出阈值: valid--
        l++
```

**完整代码**

```cpp
// LC 76 最小覆盖子串
// 滑动窗口 + valid 计数：只在跨越阈值瞬间加减，O(1) 判断是否覆盖
#include <string>
#include <unordered_map>
#include <climits>
using namespace std;

string minWindow(string s, string t) {
    unordered_map<char, int> need, cnt;
    for (char c : t) need[c]++;

    int needKind = need.size();      // t 中不同字符种类数
    int l = 0, valid = 0;            // valid: 已满足的字符种类数
    int start = 0, minLen = INT_MAX;

    for (int r = 0; r < (int)s.size(); r++) {
        char c = s[r];
        cnt[c]++;
        if (need.count(c) && cnt[c] == need[c]) valid++;   // 刚好达标

        while (valid == needKind) {
            if (r - l + 1 < minLen) {                      // 先记录，再缩左
                minLen = r - l + 1;
                start = l;
            }
            char d = s[l];
            cnt[d]--;
            if (need.count(d) && cnt[d] == need[d] - 1) valid--;  // 掉出阈值
            l++;
        }
    }
    return minLen == INT_MAX ? "" : s.substr(start, minLen);
}
```

**复杂度**：时间 O(n + m)，空间 O(字符集)。

**易错点**
- 在缩左**之后**再记录答案 → 会把已经不合法的窗口算进去（你 README 里已记过这条）。
- `need.count(c)` 别漏：`cnt[c]` 会为无关字符建条目，不判 `need` 会误增 `valid`。
- 用 `t` 去重后的种类数当阈值，而不是 `t.size()`。

**面试追问**
- `t` 有重复字符怎么处理？→ `need` 存的是**次数**，`valid` 数的是**种类**，天然覆盖。
- 如果要求"包含 t 的任意排列"？→ 同上（LC 567 / 438 是它的简化版）。
- 复杂度为什么是 O(n) 而不是 O(n²)？→ 每个字符最多被左右指针各访问一次。
:::

:::qa LC 42 · 接雨水（Hard｜必刷）

**题意**：柱状图能接多少单位的雨水。

**提示 1（方向）**
位置 `i` 的水位 = `min(左边最高, 右边最高) - h[i]`。直接对每个位置求两侧最大值是 O(n²)；预处理两个数组是 O(n)/O(n)；**双指针可以 O(1) 空间**。

**提示 2（关键不变量）**
维护 `lmax`（`0..l` 的最大值）和 `rmax`（`r..n-1` 的最大值）。若 `lmax < rmax`，那么位置 `l` 的水位**已经被 `lmax` 决定**（右侧一定存在比自己高的柱子），可以立刻结算并右移 `l`。反之处理 `r`。

**提示 3（伪代码）**
```
l=0, r=n-1, lmax=rmax=0, res=0
while l<r:
    lmax=max(lmax,h[l]); rmax=max(rmax,h[r])
    if lmax < rmax: res += lmax-h[l]; l++
    else:           res += rmax-h[r]; r--
```

**完整代码**

```cpp
// LC 42 接雨水
// 双指针 O(1) 空间：较小的一侧最大值决定该位置水位
#include <vector>
#include <algorithm>
using namespace std;

int trap(vector<int>& h) {
    int l = 0, r = (int)h.size() - 1;
    int lmax = 0, rmax = 0, res = 0;
    while (l < r) {
        lmax = max(lmax, h[l]);
        rmax = max(rmax, h[r]);
        if (lmax < rmax) { res += lmax - h[l]; l++; }   // l 处水位由 lmax 决定
        else             { res += rmax - h[r]; r--; }
    }
    return res;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 忘记**先更新** `lmax/rmax` 再结算（顺序反了会少算/负值）。
- 用 `res += min(lmax,rmax) - h[l]` 且没判断正负 → 出现负数。
- 与 LC 11 混淆：11 求"最大面积（选两条线）"，42 求"所有位置积水之和"。

**面试追问**
- 单调栈解法怎么讲？→ 维护**递减栈**，遇到比栈顶高的柱子就弹栈按"横向水槽"结算，O(n)/O(n)。
- 前后缀最大值解法？→ `pre[i] = max(pre[i-1], h[i])`，`suf` 倒着算，再逐位求 `min(pre,suf)-h[i]`，最好讲这三种的取舍。
- 如果是二维接雨水（LC 407）？→ 最小堆从边界向内灌。
:::

---

## 今日复盘三问（合上文档自己答）

1. 对撞双指针题的**共同前提**是什么？（有序性 / 单调性，让你能安全丢弃一侧）
2. 滑动窗口题什么时候用 `valid 种类计数`，什么时候用 `last 位置数组`？（需要"包含多重集合"时用计数；只要求"不重复"时用位置）
3. 六道题里哪两道最容易被面试官追问"为什么可行"？（11 和 42，都要靠单调性/最大值论证）
