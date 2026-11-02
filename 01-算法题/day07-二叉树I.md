# Day 7 · 二叉树 I（8 题）

> 今日考点：**递归四步法**、**遍历方式的选择**、**"返回值"与"全局变量"的分工**（这是二叉树题唯一的分水岭）。

:::card 递归四步法（每道题都先套这四步，再动笔）
1. **这个函数的返回值是什么**？（高度？节点？bool？路径和？）
2. **终止条件**是什么？（`if (!root) return ...`）
3. **单层逻辑**：用左右子树的返回值做计算
4. **是否需要全局变量**？如果需要"跨子树比较"（直径、最大路径和），就要一个全局最优值

> 判据：**答案能不能"从左右子树合并得到并往上返回"**？
> 能 → 用返回值（104、226、101、108、98）；只能"在某个节点处结算、不能往上返回" → 用全局变量（543）。
:::

:::card 遍历方式选择表
| 需求 | 遍历 | 典型题 |
|---|---|---|
| 按层处理 / 需要层号 | **BFS + 队列**（每轮先固定 `q.size()`） | 102 层序、199 右视图 |
| 需要"前一个节点"或有序输出 | **中序**（BST 的中序是升序） | 94、98、230 |
| 自顶向下传递状态（路径、上下界） | **前序** + 参数 | 98 上下界、437 前缀和 |
| 自底向上合并（高度、子树信息） | **后序** | 104、543、124 |
:::

| 题号 | 题目 | 难度 | 核心 |
|---|---|---|---|
| 94 | 二叉树的中序遍历 | Easy | 递归 / 栈迭代 / Morris |
| 104 | 二叉树的最大深度 | Easy | 后序 1+max |
| 226 | 翻转二叉树 | Easy | 交换左右 |
| 101 | 对称二叉树 | Easy | 双指针互为镜像 |
| 543 | 二叉树的直径 | Easy | 后序 + 全局 max |
| 102 | 二叉树的层序遍历 | Medium | BFS 分层 |
| 108 | 有序数组转 BST | Easy | 中点分治 |
| 98 | 验证二叉搜索树 | Medium | 上下界 / 中序递增 |

:::card 节点定义（面试手写要先写出来）
```cpp
struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode* l, TreeNode* r) : val(x), left(l), right(r) {}
};
```
:::

---

:::qa LC 94 · 二叉树的中序遍历（Easy｜必刷）

**题目**
给你二叉树的根节点 `root`，返回它节点值的**中序遍历**（左 → 根 → 右）。

**示例 1**
```
输入：root = [1,null,2,3]
输出：[1,3,2]
```

**示例 2**
```
输入：root = []
输出：[]
```

**示例 3**
```
输入：root = [1]
输出：[1]
```

**约束**：节点数范围 `[0, 100]`；`-100 <= Node.val <= 100`
**进阶**：递归很简单，你能用迭代算法完成吗？

**提示 1（方向）**
中序 = 左子树 → 根 → 右子树。递归天然匹配；迭代需要**显式栈**模拟"一路向左，再回退"。

**提示 2（关键不变量）**
迭代版：先把整条左链压栈（最左的节点最先出栈），弹出时访问它，然后转向它的右子树继续压左链。栈里存的正是"已访问左子树但还没访问自身的节点"。

**提示 3（伪代码）**
```
cur = root
while cur 或 st 非空:
    while cur: st.push(cur); cur = cur->left
    cur = st.pop(); 访问 cur
    cur = cur->right
```

**完整代码（递归）**

```cpp
// LC 94 中序遍历（递归）
#include <vector>
using namespace std;
struct TreeNode { int val; TreeNode *left, *right; TreeNode(int x): val(x), left(nullptr), right(nullptr) {} };

void dfs(TreeNode* root, vector<int>& res) {
    if (!root) return;
    dfs(root->left, res);       // 左
    res.push_back(root->val);   // 根
    dfs(root->right, res);      // 右
}
vector<int> inorderTraversal(TreeNode* root) {
    vector<int> res;
    dfs(root, res);
    return res;
}
```

**完整代码（迭代）**

```cpp
// LC 94 中序遍历（栈迭代）
#include <vector>
#include <stack>
vector<int> inorderTraversal(TreeNode* root) {
    vector<int> res;
    stack<TreeNode*> st;
    TreeNode* cur = root;
    while (cur || !st.empty()) {
        while (cur) { st.push(cur); cur = cur->left; }   // 一路向左
        cur = st.top(); st.pop();
        res.push_back(cur->val);                          // 访问
        cur = cur->right;                                 // 转向右子树
    }
    return res;
}
```

**复杂度**：时间 O(n)，空间 O(n)（递归栈/显式栈）。

**易错点**
- 迭代版漏掉 `cur = cur->right` → 死循环。
- 递归版把 `push_back` 放错位置 → 变成前序/后序。

**面试追问**
- 前序、后序的迭代版怎么写？→ 前序：压栈后先右后左；后序：按"根右左"前序再反转。
- **Morris 遍历**（O(1) 空间）？→ 用叶子节点的空右指针指向后继，遍历后恢复。
:::

:::qa LC 104 · 二叉树的最大深度（Easy｜必刷）

**题目**
给定一个二叉树 `root`，返回其**最大深度**。
二叉树的最大深度是指从根节点到最远叶子节点的最长路径上的**节点数**。

**示例 1**
```
输入：root = [3,9,20,null,null,15,7]
输出：3
解释：最大深度路径 3 → 20 → 15（或 7），节点数 3
```

**示例 2**
```
输入：root = [1,null,2]
输出：2
```

**约束**：节点数范围 `[0, 10^4]`；`-100 <= Node.val <= 100`

**提示 1（方向）**
深度可以**自底向上合并**：当前深度 = 1 + max(左深度, 右深度) → 后序遍历 + 返回值。

**提示 2（关键不变量）**
`maxDepth(nullptr) = 0`，于是叶子节点返回 `1`，与公式一致。**不要**把空节点当成 `-1`（那是"边数"的定义，本题是节点数）。

**提示 3（伪代码）**
```
if !root: return 0
return 1 + max(depth(left), depth(right))
```

**完整代码**

```cpp
// LC 104 二叉树的最大深度
#include <algorithm>
int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}
```

**复杂度**：时间 O(n)，空间 O(h)（递归栈，最坏 O(n)）。

**易错点**
- 用全局变量累加 `+1` 而不返回值 → 左右子树会重复计数。
- 求**最小深度**（LC 111）时直接 `1 + min(...)` → 单链树会被空子树拉成 1，必须特判只有一个孩子的情况。

**面试追问**
- 用 BFS 怎么做？→ 层数即深度，且可以在第一个叶子出现时提前返回。
- LC 111 最小深度怎么写？→ `if (!left) return 1 + rightDepth; if (!right) return 1 + leftDepth;`
- 递归会爆栈吗？→ 链状树 n=10^4 时可能，工程上可改 BFS。
:::

:::qa LC 226 · 翻转二叉树（Easy｜必刷）

**题目**
给你一棵二叉树的根节点 `root`，翻转这棵二叉树，并返回其根节点。

**示例 1**
```
输入：root = [4,2,7,1,3,6,9]
输出：[4,7,2,9,6,3,1]
```

**示例 2**
```
输入：root = [2,1,3]
输出：[2,3,1]
```

**示例 3**
```
输入：root = []
输出：[]
```

**约束**：节点数范围 `[0, 100]`；`-100 <= Node.val <= 100`

**提示 1（方向）**
每个节点只需要**交换左右孩子**，然后递归处理两棵子树。先换后递归、先递归后换都可以（前序/后序都行）。

**提示 2（关键不变量）**
**中序不行**：中序是"左 → 根 → 右"，交换之后原来的左子树变成了右子树，如果先递归左边再交换，就会对同一棵子树递归两次。

**提示 3（伪代码）**
```
if !root: return null
swap(root->left, root->right)
invert(root->left); invert(root->right)
return root
```

**完整代码**

```cpp
// LC 226 翻转二叉树
#include <algorithm>
TreeNode* invertTree(TreeNode* root) {
    if (!root) return nullptr;
    swap(root->left, root->right);   // 交换
    invertTree(root->left);          // 递归
    invertTree(root->right);
    return root;
}
```

**复杂度**：时间 O(n)，空间 O(h)。

**易错点**
- 只交换根，不递归 → 子树的左右没换。
- 用中序写（见提示 2）。
- 以为要新建节点（原地交换即可，不需要返回值构造）。

**面试追问**
- 迭代写法？→ 队列 BFS，每弹出一个节点就交换它的孩子。
- 为什么中序会错？→ 见提示 2（这是本题最有区分度的追问）。
- 这题和"判断两棵树互为镜像"（101）什么关系？→ 101 是"交换后和另一棵相同"。
:::

:::qa LC 101 · 对称二叉树（Easy｜必刷）

**题目**
给你一个二叉树的根节点 `root`，检查它是否**轴对称**。

**示例 1**
```
输入：root = [1,2,2,3,4,4,3]
输出：true
```

**示例 2**
```
输入：root = [1,2,2,null,3,null,3]
输出：false
```

**约束**：节点数范围 `[1, 1000]`；`-100 <= Node.val <= 100`

**提示 1（方向）**
对称不是"每棵子树自己对称"，而是**左右两棵子树互为镜像** → 写一个辅助函数 `mirror(a, b)`，比较两棵树的"交叉对应"位置。

**提示 2（关键不变量）**
`mirror(a, b)` 成立的条件：`a->val == b->val` 且 `mirror(a->left, b->right)` 且 `mirror(a->right, b->left)` —— 注意是**交叉**（左对右、右对左），不是同侧对同侧。

**提示 3（伪代码）**
```
mirror(a,b):
    if !a and !b: return true
    if !a or !b:  return false
    return a->val==b->val and mirror(a->left,b->right) and mirror(a->right,b->left)
isSymmetric(root): return !root or mirror(root->left, root->right)
```

**完整代码**

```cpp
// LC 101 对称二叉树
bool mirror(TreeNode* a, TreeNode* b) {
    if (!a && !b) return true;                 // 都空
    if (!a || !b) return false;                // 一空一不空
    return a->val == b->val
        && mirror(a->left, b->right)           // 交叉比较
        && mirror(a->right, b->left);
}

bool isSymmetric(TreeNode* root) {
    return !root || mirror(root->left, root->right);
}
```

**复杂度**：时间 O(n)，空间 O(h)。

**易错点**
- 写成 `isSymmetric(root->left) && isSymmetric(root->right)` → 变成"两棵子树各自对称"，示例 2 会误判为 true。
- 同侧比较（`mirror(a->left, b->left)`）→ 变成判断"相同"。
- 漏掉"一空一不空"的分支。

**面试追问**
- 迭代写法？→ 队列成对入队：每次取两个节点比较，再按 `(a->left, b->right)`、`(a->right, b->left)` 入队。
- 与 LC 100「相同的树」的区别？→ 100 是同侧比较，101 是交叉比较。
:::

:::qa LC 543 · 二叉树的直径（Easy｜必刷）

**题目**
给你一棵二叉树的根节点，返回该树的**直径**。
二叉树的直径是指树中任意两个节点之间最长路径的**长度**。这条路径可能经过根节点，也可能不经过。
两个节点之间路径的长度由它们之间的**边数**表示。

**示例 1**
```
输入：root = [1,2,3,4,5]
输出：3
解释：最长路径为 [4,2,1,3] 或 [5,2,1,3]，边数为 3
```

**示例 2**
```
输入：root = [1,2]
输出：1
```

**约束**：节点数范围 `[1, 10^4]`；`-100 <= Node.val <= 100`

**提示 1（方向）**
以某个节点为"最高点"的路径长度 = 左子树高度 + 右子树高度。**答案可能出现在任意子树里**，所以不能只返回、必须在遍历中用一个全局变量结算。

**提示 2（关键不变量）**
函数返回**高度**（节点数），但全局 `best` 记录**边数** = `L + R`（左右高度之和就是经过该点的边数）。
注意返回给父节点的只能是 **`1 + max(L, R)`**（路径不能分叉）。

**提示 3（伪代码）**
```
depth(root):
    if !root: return 0
    L = depth(left); R = depth(right)
    best = max(best, L + R)      // 以 root 为拐点
    return 1 + max(L, R)         // 只能选一边上去
```

**完整代码**

```cpp
// LC 543 二叉树的直径
#include <algorithm>
int best = 0;                      // 多测时要重置

int depth(TreeNode* root) {
    if (!root) return 0;
    int L = depth(root->left);
    int R = depth(root->right);
    best = max(best, L + R);       // 边数 = 左右高度之和
    return 1 + max(L, R);          // 给父节点的单边高度
}

int diameterOfBinaryTree(TreeNode* root) {
    best = 0;                      // 重要：全局变量必须在入口重置
    depth(root);
    return best;
}
```

**复杂度**：时间 O(n)，空间 O(h)。

**易错点**
- 更新成 `L + R + 1`（那是**节点数**，本题要边数）。
- 忘记重置全局 `best` → 多次调用/在线评测多组数据时出错。
- 试图 `return L + R` 给父节点 → 路径分叉，答案被放大。

**面试追问**
- 如果要返回**节点数**而不是边数？→ `L + R + 1`。
- 与 LC 124 最大路径和的关系？→ 完全同构：124 把"高度"换成"最大贡献和"，把"加法"换成"节点值"。
- 为什么不能只从根算？→ 最长路径可能完全在某个子树内部（示例 1 的答案经过根，但很多树不经过）。
:::

:::qa LC 102 · 二叉树的层序遍历（Medium｜必刷）

**题目**
给你二叉树的根节点 `root`，返回其节点值的**层序遍历**（即逐层地，从左到右访问所有节点）。

**示例 1**
```
输入：root = [3,9,20,null,null,15,7]
输出：[[3],[9,20],[15,7]]
```

**示例 2**
```
输入：root = [1]
输出：[[1]]
```

**示例 3**
```
输入：root = []
输出：[]
```

**约束**：节点数范围 `[0, 2000]`；`-1000 <= Node.val <= 1000`

**提示 1（方向）**
BFS + 队列。关键是**每层开始前先固定本层节点数** `n = q.size()`，然后只弹 `n` 次。

**提示 2（关键不变量）**
如果不先固定 `n`，而是 `while (!q.empty())` 边弹边把子节点入队，就会把下一层的节点混进当前层（串层）。

**提示 3（伪代码）**
```
q.push(root)
while q 非空:
    n = q.size(); level = []
    repeat n times: 弹出 → 记录 → 左右孩子入队
    res.push(level)
```

**完整代码**

```cpp
// LC 102 二叉树的层序遍历
#include <vector>
#include <queue>
using namespace std;

vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> res;
    if (!root) return res;

    queue<TreeNode*> q;
    q.push(root);

    while (!q.empty()) {
        int n = q.size();              // 先固定本层节点数
        vector<int> level;
        for (int i = 0; i < n; i++) {
            TreeNode* cur = q.front(); q.pop();
            level.push_back(cur->val);
            if (cur->left)  q.push(cur->left);
            if (cur->right) q.push(cur->right);
        }
        res.push_back(level);
    }
    return res;
}
```

**复杂度**：时间 O(n)，空间 O(w)（w 为最大层宽）。

**易错点**
- 不固定 `n` → 串层。
- 空树没判 → 输出 `[[]]` 而不是 `[]`。
- 用 `for (auto x : q)` 遍历队列（不能边改边遍历）。

**面试追问**
- 锯齿形层序遍历（LC 103）？→ 奇数层反转 `level`。
- 右视图（LC 199）？→ 每层取最后一个。
- 每层最大值（LC 515）？→ 同一模板。
:::

:::qa LC 108 · 将有序数组转换为二叉搜索树（Easy｜必刷）

**题目**
给你一个整数数组 `nums`，其中元素已经按**升序**排列，请你将其转换为一棵**高度平衡**的二叉搜索树。
> 高度平衡二叉树：每个节点的左右两个子树的高度差的绝对值不超过 1。

**示例 1**
```
输入：nums = [-10,-3,0,5,9]
输出：[0,-3,9,-10,null,5]
解释：[0,-10,5,null,-3,null,9] 也是正确答案（答案不唯一）
```

**示例 2**
```
输入：nums = [1,3]
输出：[3,1]
解释：[1,null,3] 和 [3,1] 都是正确答案
```

**约束**：`1 <= nums.length <= 10^4`；`-10^4 <= nums[i] <= 10^4`；`nums` 严格递增

**提示 1（方向）**
BST 的中序遍历是升序，所以"有序数组"就是这棵树的中序序列。要让树平衡 → 每次取**中点**当根，左右两半递归。

**提示 2（关键不变量）**
取中点保证左右子数组长度差 ≤ 1，递归下去自然平衡。答案不唯一（取左中点或右中点都对）。

**提示 3（伪代码）**
```
build(l, r):
    if l > r: return null
    m = (l+r)/2
    root = new TreeNode(a[m])
    root->left = build(l, m-1); root->right = build(m+1, r)
    return root
```

**完整代码**

```cpp
// LC 108 将有序数组转换为二叉搜索树
#include <vector>
using namespace std;

TreeNode* build(vector<int>& a, int l, int r) {
    if (l > r) return nullptr;
    int m = l + (r - l) / 2;          // 取中点当根
    TreeNode* root = new TreeNode(a[m]);
    root->left  = build(a, l, m - 1);
    root->right = build(a, m + 1, r);
    return root;
}

TreeNode* sortedArrayToBST(vector<int>& nums) {
    return build(nums, 0, (int)nums.size() - 1);   // 注意 size_t 转 int
}
```

**复杂度**：时间 O(n)，空间 O(log n)（递归栈）。

**易错点**
- `nums.size() - 1` 在 C++ 里是 `size_t` 运算，空数组时会变成巨大值 → 显式 `(int)`。
- 取 `l` 或 `r` 当根 → 退化成链表（不平衡）。
- 忘记 `l > r` 的终止条件。

**面试追问**
- 为什么取中点就平衡？→ 每层左右长度差 ≤ 1。
- 答案唯一吗？→ 不唯一（左中点/右中点都合法），面试时说清这一点是加分项。
- 如果数组是**链表**（LC 109）？→ 用快慢指针找中点，或用中序 + 建树的技巧。
:::

:::qa LC 98 · 验证二叉搜索树（Medium｜必刷）

**题目**
给你一个二叉树的根节点 `root`，判断其是否是一个**有效的二叉搜索树**。
有效 BST 定义如下：
- 节点的**左子树**只包含**小于**当前节点的数；
- 节点的**右子树**只包含**大于**当前节点的数；
- 所有左子树和右子树自身必须也是二叉搜索树。

**示例 1**
```
输入：root = [2,1,3]
输出：true
```

**示例 2**
```
输入：root = [5,1,4,null,null,3,6]
输出：false
解释：根节点是 5，但是右子节点的值是 4
```

**约束**：节点数范围 `[1, 10^4]`；`-2^31 <= Node.val <= 2^31 - 1`

**提示 1（方向）**
**只比较父子是错的**：`[5,1,4,null,null,3,6]` 里 3 比 5 小却出现在右子树。必须把"祖先约束"往下传 → 前序 + 上下界参数，或者用中序遍历必须严格递增。

**提示 2（关键不变量）**
`valid(root, lo, hi)`：当前节点必须满足 `lo < val < hi`；递归左子树时上界收紧为 `val`，右子树下界收紧为 `val`。
**边界必须用 `long long`**：`val` 可以等于 `INT_MAX`，用 `INT_MIN/MAX` 当开区间会误判。

**提示 3（伪代码）**
```
valid(root, lo, hi):
    if !root: return true
    if val <= lo or val >= hi: return false
    return valid(left, lo, val) and valid(right, val, hi)
```

**完整代码（上下界，推荐）**

```cpp
// LC 98 验证二叉搜索树（上下界）
#include <climits>
using namespace std;

bool valid(TreeNode* root, long long lo, long long hi) {
    if (!root) return true;
    if (root->val <= lo || root->val >= hi) return false;
    return valid(root->left, lo, root->val)      // 左子树上界收紧
        && valid(root->right, root->val, hi);    // 右子树下界收紧
}

bool isValidBST(TreeNode* root) {
    return valid(root, LLONG_MIN, LLONG_MAX);
}
```

**完整代码（中序递增）**

```cpp
// LC 98 中序遍历：必须严格递增
bool isValidBST(TreeNode* root) {
    stack<TreeNode*> st;
    TreeNode* cur = root;
    long long prev = LLONG_MIN;      // 用 long long 避免 INT_MIN 边界
    while (cur || !st.empty()) {
        while (cur) { st.push(cur); cur = cur->left; }
        cur = st.top(); st.pop();
        if ((long long)cur->val <= prev) return false;   // 不是严格递增
        prev = cur->val;
        cur = cur->right;
    }
    return true;
}
```

**复杂度**：时间 O(n)，空间 O(h)。

**易错点**
- 只比较 `root->left->val < root->val` → 漏掉祖先约束（示例 2 直接错）。
- 上下界用 `int` / `INT_MIN` → `val == INT_MIN` 或 `INT_MAX` 时误判。
- 中序版用 `<=` 之外的条件（BST 不允许相等值）。

**面试追问**
- 两种写法各自的优劣？→ 上下界原汁原味体现定义；中序版更简洁但需要额外存储前一值。
- BST 里允许重复值吗？→ 本题不允许（严格要求）；工程上要明确约定（一般放左侧或加计数）。
- 与 LC 230（第 K 小）的关系？→ 都基于"中序升序"。
:::

---

## 今日复盘四问

1. 二叉树题的第一问应该是什么？（**返回值定义 + 是否需要全局变量**）
2. 什么时候必须用全局变量？（答案在某个节点处"结算"后不能再往上返回，如 543）
3. 什么时候必须用中序？（BST 相关：98、230）
4. BFS 分层最容易错的一行是什么？（`int n = q.size();` 必须在循环开始前固定）
