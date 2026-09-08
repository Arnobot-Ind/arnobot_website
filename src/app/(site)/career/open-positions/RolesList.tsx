'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ROLE_COUNT, ROLE_GROUPS } from '@/data/careers';
import { cn } from '@/lib/dom';
import styles from './open-positions.module.css';

/** `all`, or a discipline's slug from `ROLE_GROUPS`. */
type Filter = string;

const ALL: Filter = 'all';

/**
 * The roles behind one discipline filter.
 *
 * One flat list rather than four headed groups: the reader is scanning for a
 * title, and the filter on top is the grouping — pick a discipline and the
 * list is only that discipline; leave it on All and every row says which one
 * it belongs to. The same control the Insights index filters its archive
 * with, so the two lists on the site that filter do it the same way.
 *
 * Client-side because the choice is state, not a page: the list swaps in
 * place under the reader's eye, and the viewport stays where it is.
 */
export default function RolesList() {
  const [filter, setFilter] = useState<Filter>(ALL);

  const groups = filter === ALL ? ROLE_GROUPS : ROLE_GROUPS.filter((group) => group.slug === filter);
  const rows = groups.flatMap((group) => group.roles.map((job) => ({ job, discipline: group.discipline })));
  const selected = ROLE_GROUPS.find((group) => group.slug === filter);

  return (
    <>
      {/* Toggle buttons, not tabs: there is no roving focus and no tabpanel,
          and `aria-pressed` says what these actually are. The count on the
          right is announced, so a filter change is not silent for anyone
          using a screen reader. */}
      <div className={styles.filterBar}>
        <div className={styles.filters} role="group" aria-label="Filter roles by discipline">
          <button
            type="button"
            aria-pressed={filter === ALL}
            className={cn(styles.filter, filter === ALL && styles.filterActive)}
            onClick={() => setFilter(ALL)}
          >
            All <span className={styles.filterCount}>{ROLE_COUNT}</span>
          </button>
          {ROLE_GROUPS.map((group) => (
            <button
              key={group.slug}
              type="button"
              aria-pressed={filter === group.slug}
              className={cn(styles.filter, filter === group.slug && styles.filterActive)}
              onClick={() => setFilter(group.slug)}
            >
              {group.discipline} <span className={styles.filterCount}>{group.roles.length}</span>
            </button>
          ))}
        </div>
        <p className={styles.count} role="status">
          {rows.length} {rows.length === 1 ? 'role' : 'roles'}
          {selected ? ` in ${selected.discipline}` : ` across ${ROLE_GROUPS.length} disciplines`}
        </p>
      </div>

      <ul className={styles.roleList}>
        {rows.map(({ job, discipline }) => (
          <li className={styles.role} key={job.slug}>
            {/* Every role opens the same screening flow. The role is picked
                inside it, from the list /api/roles serves out of the database,
                rather than carried in the query — the postings here and the
                roles the assessment is built from are two different sets. */}
            <Link className={styles.roleLink} href="/apply">
              <div>
                <span className={cn('micro-label', styles.roleDiscipline)}>{discipline}</span>
                <h3 className={styles.roleTitle}>{job.title}</h3>
                <p className={styles.roleBody}>{job.body}</p>
                <div className={styles.roleMeta}>
                  {job.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className={cn('link-arrow', styles.roleAction)} aria-hidden="true">
                Apply{' '}
                <span className="btn-arrow" aria-hidden="true">
                  &rarr;
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
