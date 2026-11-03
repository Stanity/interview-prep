# Day 3 · 链表 I（7 题）

> 今日考点：**指针改向的三个变量**（prev / cur / next）、**快慢指针**（找中点、判环、找入环点）、**哑结点**（dummy）简化头节点处理。
> 每题结构：完整题干 → 示例 → 约束 → 提示阶梯 ×3 → 完整 C++ → 复杂度 → 易错点 → 追问。

:::card 读题约定（本日所有题通用）
```cpp
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
```
- 面试手写时**先把这个定义写出来**（或在纸上声明），否则会被认为"代码不完整"。
- 所有题都要求**不修改节点值，只改指针**（除非题目另行说明）。
- 返回 `head` 表示返回头节点；用数组形式 `[1,2,3]` 表示链表内容。
:::

| 题号 | 题目 | 难度 | 模板一句话 | 复杂度 |
|---|---|---|---|---|
| 206 | 反转链表 | Easy | prev/cur/next 三指针改向 | O(n) / O(1) |
| 21 | 合并两个有序链表 | Easy | 哑结点 + 尾插，最后整段接上 | O(m+n) / O(1) |
| 141 | 环形链表 | Easy | 快慢指针相遇即有环 | O(n) / O(1) |
| 142 | 环形链表 II | Medium | 相遇后 head 与相遇点同步走 | O(n) / O(1) |
| 160 | 相交链表 | Easy | 走完自己换对方的头 | O(m+n) / O(1) |
| 19 | 删除倒数第 N 个 | Medium | 哑结点 + 快指针先走 N 步 | O(n) / O(1) |
| 2 | 两数相加 | Medium | 竖式加法 + carry | O(max(m,n)) / O(1) |

---

:::qa LC 206 · 反转链表（Easy｜必刷）

**题目**
给你单链表的头节点 `head`，请你反转链表，并返回反转后的链表。

**示例 1**
```
输入：head = [1,2,3,4,5]
输出：[5,4,3,2,1]
```

**示例 2**
```
输入：head = [1,2]
输出：[2,1]
```

**示例 3**
```
输入：head = []
输出：[]
```

**约束**：链表中节点数目范围 `[0, 5000]`；`-5000 <= Node.val <= 5000`
**进阶**：分别用迭代和递归完成。

**提示 1（方向）**
需要边遍历边把每个节点的 `next` 指向它的前一个节点。至少需要记住"前一个"和"当前"两个指针，但**一旦改向就丢了后继**，所以还要临时存后继。

**提示 2（关键不变量）**
循环不变式：`prev` 是"已反转部分的头"，`cur` 是"未处理部分的头"。每轮把 `cur->next` 指向 `prev`，再同步前移。**存后继必须是第一步**。

**提示 3（伪代码）**
```
prev = null, cur = head
while cur:
    nxt = cur->next     // 先存
    cur->next = prev
    prev = cur; cur = nxt
return prev             // prev 就是新头
```

**完整代码（迭代）**

```cpp
// LC 206 反转链表（迭代）
#include <cstddef>
struct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr) {} };

ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* cur = head;
    while (cur) {
        ListNode* nxt = cur->next;   // ① 先存后继，否则断链
        cur->next = prev;            // ② 反向
        prev = cur;                  // ③ 前移
        cur = nxt;
    }
    return prev;                     // prev 最终指向原尾节点
}
```

**完整代码（递归）**

```cpp
// LC 206 反转链表（递归）：先反转后面的部分，再处理自己
ListNode* reverseList(ListNode* head) {
    if (!head || !head->next) return head;   // 空或单节点
    ListNode* newHead = reverseList(head->next);
    head->next->next = head;                 // 后继指回自己
    head->next = nullptr;                    // 防止成环
    return newHead;
}
```

**复杂度**：迭代 O(n)/O(1)；递归 O(n)/O(n)（调用栈，n=5000 时可能爆栈）。

**易错点**
- 忘记存 `nxt` → 链表断掉。
- 递归版漏掉 `head->next = nullptr` → 首尾成环，返回后死循环。
- 返回 `head` 而不是 `prev`（迭代版）。

**面试追问**
- 反转区间 `[m, n]`（LC 92）？→ 找到第 `m-1` 个节点，对区间做 `n-m+1` 次头插。
- 每 k 个一组反转（LC 25）？→ Day 4 的题，是这个的推广。
- 递归为什么可能爆栈？→ `n = 5000` 深递归，取决于栈大小。
:::

:::qa LC 21 · 合并两个有序链表（Easy｜必刷）

**题目**
将两个**升序**链表合并为一个新的**升序**链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的（不新建节点）。

**示例 1**
```
输入：l1 = [1,2,4], l2 = [1,3,4]
输出：[1,1,2,3,4,4]
```

**示例 2**
```
输入：l1 = [], l2 = []
输出：[]
```

**示例 3**
```
输入：l1 = [], l2 = [0]
输出：[0]
```

**约束**：两链表节点数范围 `[0, 50]`；`-100 <= Node.val <= 100`；均按非递减顺序排列

**提示 1（方向）**
每次比较两个链表当前头节点的值，把较小的接到结果尾部。头节点的处理很烦 → 用**哑结点**（dummy）统一。

**提示 2（关键不变量）**
循环结束后必然有一个链表先空，此时**把另一个链表整段接上**即可，不需要逐个节点搬运（这是很多人的多余动作）。

**提示 3（伪代码）**
```
dummy, tail = dummy
while a && b:
    if a->val <= b->val: tail->next = a; a = a->next
    else:                tail->next = b; b = b->next
    tail = tail->next
tail->next = a ? a : b
return dummy.next
```

**完整代码**

```cpp
// LC 21 合并两个有序链表
// 哑结点 + 尾插；剩下的那段整体接上
#include <cstddef>
struct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr) {} };

ListNode* mergeTwoLists(ListNode* a, ListNode* b) {
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (a && b) {
        if (a->val <= b->val) { tail->next = a; a = a->next; }
        else                  { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = a ? a : b;      // 剩余部分整段接上
    return dummy.next;
}
```

**复杂度**：时间 O(m+n)，空间 O(1)（不新建节点）。

**易错点**
- 用 `while` 循环跑完剩余链表（多余且易错）。
- 比较用 `<` 而非 `<=`：结果仍正确，但**稳定性**会变（相等时谁在前），面试官可能追问。
- `dummy` 用栈对象返回 `dummy.next` 是对的（返回的是堆上的节点，不是 dummy 本身）。

**面试追问**
- 递归写法？→ `if (!a) return b; if (!b) return a;` 再递归接 `head->next`。
- 合并 K 个有序链表（LC 23）？→ Day 4，用最小堆或分治。
- 要求"稳定的合并"？→ 相等时优先取 `a`（就是上面的 `<=`）。
:::

:::qa LC 141 · 环形链表（Easy｜必刷）

**题目**
给你一个链表的头节点 `head`，判断链表中是否有环。
> 题目用 `pos` 表示尾节点连接到的位置（`-1` 表示无环），**它只用于标识，不作为参数传入**。
> 要求额外空间 O(1)。

**示例 1**
```
输入：head = [3,2,0,-4], pos = 1
输出：true
解释：尾节点 -4 连回下标 1 的节点 2，形成环
```

**示例 2**
```
输入：head = [1,2], pos = 0
输出：true
```

**示例 3**
```
输入：head = [1], pos = -1
输出：false
```

**约束**：节点数范围 `[0, 10^4]`；`-10^5 <= Node.val <= 10^5`

**提示 1（方向）**
哈希表存访问过的节点可以做，但需要 O(n) 空间。O(1) 空间的办法是**快慢指针（Floyd 判圈）**：慢走 1 步、快走 2 步。

**提示 2（关键不变量）**
若存在环，快指针进入环后每轮把与慢指针的距离缩短 1，环长有限 → **必然相遇**。若无环，快指针会先到 `nullptr`。

**提示 3（伪代码）**
```
slow = fast = head
while fast && fast->next:
    slow = slow->next
    fast = fast->next->next
    if slow == fast: return true
return false
```

**完整代码**

```cpp
// LC 141 环形链表
// 快慢指针：相遇则有环
#include <cstddef>
struct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr) {} };

bool hasCycle(ListNode *head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {          // 两个都必须判，否则 fast->next->next 越界
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- `while (fast && fast->next)` 少判一个 → 空指针解引用。
- **先移动再比较**（不能一开始就比 `slow == fast`，它们初始都在 head）。
- 步长用 3 会破坏"每轮距离缩短 1"的性质（不一定相遇）。

**面试追问**
- 为什么快指针走 2 步一定能相遇？→ 见提示 2 的距离论证。
- 哈希表写法？→ `unordered_set<ListNode*>`，O(n)/O(n)，简单但空间不达标。
- 链表很长但环很小？→ Floyd 仍是 O(n)（进环前 + 环内若干圈）。
:::

:::qa LC 142 · 环形链表 II（Medium｜必刷）

**题目**
给定一个链表的头节点 `head`，返回链表**开始入环的第一个节点**。如果链表无环，则返回 `null`。
> 不允许修改链表。要求 O(1) 空间。

**示例 1**
```
输入：head = [3,2,0,-4], pos = 1
输出：返回索引为 1 的节点
解释：链表中有一个环，其尾部连接到第二个节点
```

**示例 2**
```
输入：head = [1,2], pos = 0
输出：返回索引为 0 的节点
```

**示例 3**
```
输入：head = [1], pos = -1
输出：返回 null
```

**约束**：节点数范围 `[0, 10^4]`；`-10^5 <= Node.val <= 10^5`

**提示 1（方向）**
两步走：① 快慢指针找**相遇点**；② 令一个指针回到 `head`，另一个留在相遇点，两者**每次各走 1 步**，再次相遇处就是入环点。

**提示 2（关键不变量 · 必须会推）**
设 head 到入环点距离 `a`，入环点到相遇点距离 `b`，环长 `c`。
慢指针走 `a + b`；快指针走 `a + b + k·c`，且快是慢的两倍 → `2(a+b) = a+b+kc` → **`a = kc - b`**。
所以"从 head 走 a 步"与"从相遇点走 kc-b 步（绕环若干圈后回到入环点）"同时抵达入环点。

**提示 3（伪代码）**
```
slow = fast = head
while fast && fast->next:
    slow = slow->next; fast = fast->next->next
    if slow == fast:
        p = head
        while p != slow: p = p->next; slow = slow->next
        return p
return null
```

**完整代码**

```cpp
// LC 142 环形链表 II
// 相遇后：一个指针回头，同步前进，再次相遇即入环点
#include <cstddef>
struct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr) {} };

ListNode *detectCycle(ListNode *head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {                 // ① 相遇
            ListNode* p = head;
            while (p != slow) {             // ② 同步走
                p = p->next;
                slow = slow->next;
            }
            return p;                       // 入环点
        }
    }
    return nullptr;                         // 无环
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 相遇后把 `slow` 重置为 `head` 而不是另起一个指针（逻辑上等价，但容易写乱）。
- 忘记在循环外返回 `nullptr`（无环分支）。
- 公式记混（把 `a = kc - b` 说成 `a = b`），面试官一定会让你推。

**面试追问**
- 完整推导一遍（见提示 2）。
- 求**环的长度**？→ 相遇后让一个指针绕一圈数步数。
- 如果用哈希表，第一个重复出现的节点就是入环点 —— 对照说明为什么 Floyd 更省空间。
:::

:::qa LC 160 · 相交链表（Easy｜必刷）

**题目**
给你两个单链表的头节点 `headA` 和 `headB`，请你找出并返回两个单链表**相交的起始节点**。如果两个链表不存在相交节点，返回 `null`。
> 题目数据保证整个链式结构中不存在环；函数返回结果后，链表必须保持其原始结构。

**示例 1**
```
输入：intersectVal = 8, listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], skipA = 2, skipB = 3
输出：返回值为 8 的节点
解释：从各自的表头开始算起，A 为 [4,1,8,4,5]，B 为 [5,6,1,8,4,5]；相交节点值为 8
```

**示例 2**
```
输入：intersectVal = 0, listA = [2,6,4], listB = [1,5], skipA = 3, skipB = 2
输出：null（两者不相交）
```

**约束**：`1 <= m, n <= 3 * 10^4`；`1 <= Node.val <= 10^5`
**进阶**：O(m+n) 时间、O(1) 内存。

**提示 1（方向）**
长度不同是唯一障碍。如果两条链表等长，同步走就能在交点相遇 —— 那就想办法让它们**走一样长的路**。

**提示 2（关键不变量）**
指针 `p` 走完 A 后**换到 B 的头**，`q` 走完 B 后换到 A 的头。两者总路程都是 `m + n`，因此有交点时必然**同时**到达交点；无交点时两者同时变成 `nullptr`。

**提示 3（伪代码）**
```
p = headA, q = headB
while p != q:
    p = p ? p->next : headB
    q = q ? q->next : headA
return p        // 有交点返回交点，无交点返回 null
```

**完整代码**

```cpp
// LC 160 相交链表
// 双指针走完全程再换头：总路程相同（m+n）
#include <cstddef>
struct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr) {} };

ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
    ListNode *p = headA, *q = headB;
    while (p != q) {
        p = p ? p->next : headB;      // 走完 A 换到 B 的头
        q = q ? q->next : headA;      // 走完 B 换到 A 的头
    }
    return p;                          // 无交点时两者都是 nullptr，循环退出
}
```

**复杂度**：时间 O(m+n)，空间 O(1)。

**易错点**
- 写成 `while (p && q)` → 无交点时死循环。
- 在 `p == nullptr` 时 `return nullptr` 提前退出 → 有交点但长度不等时会误判。
- 用"值相等"判断相交 → 题目要求**节点指针相同**（值可能重复）。

**面试追问**
- 另一种解法？→ 先各求长度，长链先走 `|m-n|` 步，再同步走。
- 为什么"换头"能对齐？→ 总路程守恒，交点前的路程差被抹平。
- 如果允许改链表？→ 把 A 的尾接到 B 头形成环，转成 LC 142。
:::

:::qa LC 19 · 删除链表的倒数第 N 个结点（Medium｜必刷）

**题目**
给你一个链表，删除链表的**倒数第 `n` 个**结点，并且返回链表的头结点。

**示例 1**
```
输入：head = [1,2,3,4,5], n = 2
输出：[1,2,3,5]
```

**示例 2**
```
输入：head = [1], n = 1
输出：[]
```

**示例 3**
```
输入：head = [1,2], n = 1
输出：[1]
```

**约束**：节点数为 `sz`，`1 <= sz <= 30`；`0 <= Node.val <= 100`；`1 <= n <= sz`
**进阶**：用**一次遍历**实现。

**提示 1（方向）**
"倒数第 n 个"无法直接定位，但两指针保持 `n` 步间距就能：快指针先走 `n` 步，然后两指针同步走，快指针到头时慢指针正好在**待删节点的前一个**。

**提示 2（关键不变量）**
必须用**哑结点**，否则删除头节点（`n == sz`）时无处安放"前驱"。哑结点让"前驱"永远存在。

**提示 3（伪代码）**
```
dummy.next = head; fast = slow = dummy
for i in 1..n: fast = fast->next
while fast->next: fast = fast->next; slow = slow->next
slow->next = slow->next->next
return dummy.next
```

**完整代码**

```cpp
// LC 19 删除倒数第 N 个结点
// 哑结点 + 快慢指针保持 n 步间距，一次遍历
#include <cstddef>
struct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr) {} };

ListNode* removeNthFromEnd(ListNode* head, int n) {
    ListNode dummy(0);
    dummy.next = head;
    ListNode *fast = &dummy, *slow = &dummy;
    for (int i = 0; i < n; i++) fast = fast->next;   // 快先走 n 步
    while (fast->next) {                             // 再一起走
        fast = fast->next;
        slow = slow->next;
    }
    slow->next = slow->next->next;                   // slow 停在待删节点的前驱
    return dummy.next;
}
```

**复杂度**：时间 O(n)（一次遍历），空间 O(1)。

**易错点**
- 不用哑结点 → `n == sz` 时删除头节点崩溃。
- 快指针走了 `n-1` 步 → `slow` 停在待删节点本身，删不掉。
- 忘记 `return dummy.next`（`head` 可能已被删）。

**面试追问**
- 如果要求返回被删除节点的值？→ 删除前先存。
- 如果 `n` 非法（> sz）？→ 题目保证合法，但工程上要校验。
- 双向链表怎么做？→ 直接走到尾再回退 n 步。
:::

:::qa LC 2 · 两数相加（Medium｜必刷）

**题目**
给你两个**非空**的链表，表示两个非负的整数。它们每位数字都是按照**逆序**的方式存储的，并且每个节点只能存储**一位**数字。
请你将两个数相加，并以相同形式返回一个表示和的链表。
> 你可以假设除了数字 0 之外，这两个数都不会以 0 开头。

**示例 1**
```
输入：l1 = [2,4,3], l2 = [5,6,4]
输出：[7,0,8]
解释：342 + 465 = 807，逆序存为 [7,0,8]
```

**示例 2**
```
输入：l1 = [0], l2 = [0]
输出：[0]
```

**示例 3**
```
输入：l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
输出：[8,9,9,9,0,0,0,1]
解释：9999999 + 9999 = 10009998，逆序存为 [8,9,9,9,0,0,0,1]
```

**约束**：每个链表的节点数在 `[1, 100]` 内；`0 <= Node.val <= 9`
> 注意节点数可达 100 位 —— **不能用 int 存整个数再相加**（会溢出）。

**提示 1（方向）**
逆序存储反而是好事：直接从低位开始，模拟竖式加法即可。核心是维护 `carry`。

**提示 2（关键不变量）**
循环条件必须是 `l1 ‖ l2 ‖ carry` —— **进位可能是最后一个节点**（示例 3 的最高位 1）。少了 `carry` 就会丢最高位。

**提示 3（伪代码）**
```
dummy, tail = dummy; carry = 0
while l1 || l2 || carry:
    sum = carry + (l1 ? l1->val : 0) + (l2 ? l2->val : 0)
    carry = sum / 10
    tail->next = new Node(sum % 10); tail = tail->next
    l1 = l1 ? l1->next : nullptr
    l2 = l2 ? l2->next : nullptr
return dummy.next
```

**完整代码**

```cpp
// LC 2 两数相加
// 竖式加法：逐位求和 + carry，注意最高位进位
#include <cstddef>
struct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr) {} };

ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    ListNode dummy(0);
    ListNode* tail = &dummy;
    int carry = 0;
    while (l1 || l2 || carry) {
        int sum = carry;
        if (l1) { sum += l1->val; l1 = l1->next; }
        if (l2) { sum += l2->val; l2 = l2->next; }
        carry = sum / 10;
        tail->next = new ListNode(sum % 10);
        tail = tail->next;
    }
    return dummy.next;
}
```

**复杂度**：时间 O(max(m,n))，空间 O(1)（除结果节点）。

**易错点**
- 循环条件漏 `carry` → 最高位进位丢失（示例 3 直接错）。
- 把两条链表转成 `int`/`long long` 再相加 → 100 位必溢出。
- `l1 = l1->next` 时不判空 → 空指针。

**面试追问**
- 如果**正序**存储（LC 445）？→ 用两个栈倒序取出，或先反转两条链表再相加。
- 如果要求不能新建节点？→ 复用 `l1` 的节点（就地修改），但会污染输入。
- 如果是十进制以外的进制？→ 把 `10` 换成对应的 base 即可。
:::

---

## 今日复盘三问

1. 链表题的**三大套路**是什么？（三指针改向、快慢指针、哑结点）
2. 142 的 `a = kc - b` 会推吗？如果推不出来，说明"相遇后同步走"这一步只是背下来的。
3. 哪些题**必须**用哑结点？（19 删头节点、21/2/23 尾插建表、24/25 交换/翻转）
